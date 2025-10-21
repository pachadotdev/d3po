import * as d3 from 'd3';
import D3po from '../D3po.js';
import {
  validateData,
  groupBy,
  calculateBoxStats,
  showTooltip,
  hideTooltip,
  maybeEvalJSFormatter,
  escapeHtml,
  getHighlightColor,
} from '../utils.js';

/**
 * Box plot visualization
 * @augments D3po
 */
export default class BoxPlot extends D3po {
  /**
   * Creates a box plot
   * @param {string|HTMLElement} container - Container selector or element
   * @param {object} options - Configuration options
   * @param {string} options.x - X-axis field name
   * @param {string} options.y - Y-axis field name
   * @param {string} [options.color] - Color field name
   */
  constructor(container, options) {
    super(container, options);

    if (!options.x || !options.y) {
      throw new Error('Box plot requires x and y fields');
    }

    this.xField = options.x;
    this.yField = options.y;
    this.colorField = options.color;
  }

  /**
   * Renders the box plot
   * @returns {BoxPlot} This instance for chaining
   */
  render() {
    if (!this.data) {
      throw new Error('No data provided');
    }

    validateData(this.data, [this.xField, this.yField]);

    // Determine if we need horizontal box plots (when y-field is categorical)
    const firstItem = this.data[0];
    const isHorizontal = typeof firstItem[this.yField] === 'string';

    // Group data by the categorical field
    const categoryField = isHorizontal ? this.yField : this.xField;
    const valueField = isHorizontal ? this.xField : this.yField;

    // If R provided formatted columns mapping, and the formatted column for
    // the categoryField exists, use the formatted column only for display
    // (tick labels). Grouping / statistics are still computed on the original
    // data values so numeric operations remain correct.
    const formattedCols = (this.options && this.options.formattedCols) ? this.options.formattedCols : null;
    // Some R code registers formattedCols using aesthetic names like 'x' or 'y'.
    // Provide a helper to resolve the correct formatted column when possible.
    const resolveFormattedField = (field) => {
      if (!formattedCols) return null;
      if (formattedCols[field]) return formattedCols[field];
      // fallback: if field is the xField/yField, check 'x'/'y' keys
      if (field === this.xField && formattedCols.x) return formattedCols.x;
      if (field === this.yField && formattedCols.y) return formattedCols.y;
      return null;
    };
    let grouped;
  // Group by the raw categoryField values (preserve data grouping)
  grouped = groupBy(this.data, categoryField);
    const boxData = Object.entries(grouped).map(([key, values]) => ({
      // `group` holds the raw category key used for positioning. We'll
      // compute a separate `label` field for display using formattedCols
      // when available (this preserves positioning but shows R-formatted
      // labels, e.g. uppercase values).
      group: key,
      // Resolve formatted field name (allow keys by field name or by 'x'/'y')
      label: (() => {
        const ff = resolveFormattedField(categoryField);
        return (ff && values[0][ff] !== undefined) ? values[0][ff] : key;
      })(),
      stats: calculateBoxStats(values.map(d => d[valueField])),
      color: this.colorField
        ? values[0][this.colorField]
        : d3.schemeCategory10[0],
    }));

    // Create scales based on orientation
    let categoryScale, valueScale;

    // Resolve axis label text (allow user overrides). Use raw field names by default.
  const xLabelText = (this.options && (this.options.xLabel || (this.options.axisLabels && this.options.axisLabels.x))) ? (this.options.xLabel || this.options.axisLabels.x) : (this.xField ? String(this.xField) : '');
  const yLabelText = (this.options && (this.options.yLabel || (this.options.axisLabels && this.options.axisLabels.y))) ? (this.options.yLabel || this.options.axisLabels.y) : (this.yField ? String(this.yField) : '');

    if (isHorizontal) {
      // Horizontal: y is categorical, x is numeric
      // Use formatted labels (if present) as the domain so ticks render
      // exactly as provided by R.
      categoryScale = d3
        .scaleBand()
        .domain(boxData.map(d => d.label))
        .range([0, this.getInnerHeight()])
        .padding(0.2);

      valueScale = d3
        .scaleLinear()
        .domain([
          d3.min(boxData, d => d.stats.min),
          d3.max(boxData, d => d.stats.max),
        ])
        .nice()
        .range([0, this.getInnerWidth()]);
    } else {
      // Vertical: x is categorical, y is numeric
      categoryScale = d3
        .scaleBand()
        .domain(boxData.map(d => d.label))
        .range([0, this.getInnerWidth()])
        .padding(0.2);

      valueScale = d3
        .scaleLinear()
        .domain([
          d3.min(boxData, d => d.stats.min),
          d3.max(boxData, d => d.stats.max),
        ])
        .nice()
        .range([this.getInnerHeight(), 0]);
    }

    // Add axes with measurement-aware label placement (borrowed from BarChart)
    // We'll measure tick text widths and label bbox to avoid overlap with rotated y-labels.
    let bottomAxis = null;
    let leftAxis = null;

    if (isHorizontal) {
      bottomAxis = d3.axisBottom(valueScale);
      if (this.options && this.options.axisFormatters && this.options.axisFormatters.x) bottomAxis.tickFormat(this.options.axisFormatters.x);

      leftAxis = d3.axisLeft(categoryScale);
      // If we have formatted labels, show them on the categorical axis
      if (formattedCols && formattedCols[categoryField]) {
        leftAxis.tickFormat(d => {
          const found = boxData.find(b => b.group === d);
          return found ? found.label : d;
        });
      }
    } else {
      bottomAxis = d3.axisBottom(categoryScale);
      // For categorical bottom axis, prefer formatted label when available
      if (formattedCols && formattedCols[categoryField]) {
        bottomAxis.tickFormat(d => {
          const found = boxData.find(b => b.group === d);
          return found ? found.label : d;
        });
      }
      if (this.options && this.options.axisFormatters && this.options.axisFormatters.x) bottomAxis.tickFormat(this.options.axisFormatters.x);

      leftAxis = d3.axisLeft(valueScale);
      if (this.options && this.options.axisFormatters && this.options.axisFormatters.y) leftAxis.tickFormat(this.options.axisFormatters.y);
    }

    // Measure max tick width and label bbox to possibly reclaim left margin space
    let measuredMaxTickWidth = 0;
    let measuredLabelBBoxHeight = 0;
    // current effective inner sizes (may change if we adjust margins)
    let effectiveInnerWidth = this.getInnerWidth();
    let effectiveInnerHeight = this.getInnerHeight();
    // default to true (opt-out by setting useLeftMarginSpace: false)
    const useLeftMarginSpace = (this.options && this.options.useLeftMarginSpace !== false);

    try {
      const probe = this.svg.append('g').attr('class', 'd3po-probe');
      probe.call(leftAxis);
      try {
        const ticks = probe.selectAll('.tick text').nodes();
        if (ticks && ticks.length) measuredMaxTickWidth = d3.max(ticks, n => n.getBBox().width) || 0;
      } catch (e) {
        void 0;
      }
      probe.remove();
      try {
        const lab = this.svg.append('text').attr('x', -9999).attr('y', -9999).style('font-size', '14px').text(isHorizontal ? this.xField : this.yField);
        measuredLabelBBoxHeight = lab.node().getBBox().height || 0;
        lab.remove();
      } catch (e) {
        measuredLabelBBoxHeight = 14;
      }

      const gap = (this.yLabelGap !== undefined) ? this.yLabelGap : 12;
      const requiredLeft = Math.ceil(measuredMaxTickWidth + gap + measuredLabelBBoxHeight + 8);
      const currentLeft = (this.options && this.options.margin && this.options.margin.left) || 60;
      if (requiredLeft > currentLeft) {
        this.options.margin = this.options.margin || {};
        this.options.margin.left = requiredLeft;
        // update effective inner sizes and scales to match new margins
        effectiveInnerWidth = this.getInnerWidth();
        effectiveInnerHeight = this.getInnerHeight();
        if (categoryScale && categoryScale.range) {
          if (isHorizontal) categoryScale.range([0, effectiveInnerHeight]); else categoryScale.range([0, effectiveInnerWidth]);
        }
        if (valueScale && valueScale.range) {
          if (isHorizontal) valueScale.range([0, effectiveInnerWidth]); else valueScale.range([effectiveInnerHeight, 0]);
        }
        if (this.chart && this.chart.attr) this.chart.attr('transform', `translate(${this.options.margin.left},${this.options.margin.top})`);
      }
  } catch (e) { void 0; }

    // Optionally reclaim left margin space similar to BarChart (shifts chart translate and widens inner area)
    if (useLeftMarginSpace && measuredMaxTickWidth > 0) {
      const gap = (this.yLabelGap !== undefined) ? this.yLabelGap : 12;
      const measuredRequiredLeft = Math.ceil(measuredMaxTickWidth + gap + measuredLabelBBoxHeight + 8);
      const marginLeft = (this.options && this.options.margin && this.options.margin.left) || 60;
      const safetyBuffer = 4; // px
      const targetLeft = Math.max(0, (measuredRequiredLeft || 0) + safetyBuffer);
      const delta = marginLeft - targetLeft;
      const baseInner = this.getInnerWidth();
      const newInner = Math.max(20, Math.round(baseInner + Math.max(0, delta)));
      effectiveInnerWidth = newInner;
      effectiveInnerHeight = this.getInnerHeight();
      if (categoryScale && categoryScale.range) {
        if (isHorizontal) categoryScale.range([0, effectiveInnerHeight]); else categoryScale.range([0, effectiveInnerWidth]);
      }
      if (valueScale && valueScale.range) {
        if (isHorizontal) valueScale.range([0, effectiveInnerWidth]); else valueScale.range([effectiveInnerHeight, 0]);
      }
      const translateX = targetLeft;
      if (this.chart && this.chart.attr) this.chart.attr('transform', `translate(${translateX},${this.options.margin.top})`);
    }

    // Append axes using possibly-updated effective inner sizes.
    // Attach axes to groups so we can measure ticks reliably and place labels like BarChart.
    const xg = this.chart
      .append('g')
      .attr('transform', `translate(0,${effectiveInnerHeight})`)
      .call(bottomAxis);
    try {
      // rotate x tick labels when necessary (similar heuristics to BarChart)
      const xTicks = xg.selectAll('.tick text').nodes();
      let maxTickWidth = 0, maxTickHeight = 0;
      if (xTicks && xTicks.length) {
        maxTickWidth = d3.max(xTicks, n => n.getBBox().width) || 0;
        maxTickHeight = d3.max(xTicks, n => n.getBBox().height) || 0;
      }
      let rotateX = false;
      if (categoryScale && categoryScale.bandwidth) {
        const bw = categoryScale.bandwidth();
        if (maxTickWidth > bw * 0.9) rotateX = true;
      } else if (xTicks && xTicks.length) {
        const avgSpace = Math.max(10, effectiveInnerWidth / xTicks.length);
        if (maxTickWidth > avgSpace * 0.9) rotateX = true;
      }
      if (rotateX) xg.selectAll('text').attr('transform', 'rotate(-45)').style('text-anchor', 'end');
      const xLabelPadding = Math.max(8, maxTickHeight + 8);
      this.chart.append('text').attr('class', 'x-axis-label').attr('text-anchor', 'middle').attr('x', effectiveInnerWidth / 2).attr('y', effectiveInnerHeight + xLabelPadding + (rotateX ? 36 : 24)).attr('fill', 'black').style('font-size', '14px').text(xLabelText);
    } catch (e) {
      this.chart.append('text').attr('class', 'x-axis-label').attr('text-anchor', 'middle').attr('x', effectiveInnerWidth / 2).attr('y', effectiveInnerHeight + (isHorizontal ? 45 : 65)).attr('fill', 'black').style('font-size', '14px').text(xLabelText);
    }

    // Append left axis to its own group so we can append the rotated label on the axis group
    const yg = this.chart.append('g').call(leftAxis);
    try {
      const yTicks = yg.selectAll('.tick text').nodes();
      const yMaxTickWidth = (yTicks && yTicks.length) ? d3.max(yTicks, n => n.getBBox().width) : measuredMaxTickWidth;
      const labelGap = (this.yLabelGap !== undefined) ? this.yLabelGap : 12;
      const measuredLabelH = measuredLabelBBoxHeight || 14;
      const labelBaseline = Math.max(yMaxTickWidth + labelGap, measuredLabelH + labelGap);
      const adaptivePadding = Math.min(36, Math.max(4, Math.round(yMaxTickWidth * 0.08)));
      let labelOffset = labelBaseline + adaptivePadding + 10;
      const measuredRequiredLeft = (yMaxTickWidth > 0) ? Math.ceil(yMaxTickWidth + labelGap + measuredLabelH + 8) : null;
      const marginLeft = (this.options && this.options.margin && this.options.margin.left) || 60;
      let maxAllowed = marginLeft - 4;
      if (measuredRequiredLeft != null) maxAllowed = Math.max(10, Math.min(maxAllowed, measuredRequiredLeft)); else maxAllowed = Math.max(10, maxAllowed);
      if (labelOffset > maxAllowed) labelOffset = maxAllowed;
      // Append rotated y label to the left axis group so it sits next to ticks and moves with the axis
      yg.append('text').attr('class', 'y-axis-label').attr('transform', `translate(${-labelOffset},${effectiveInnerHeight / 2}) rotate(-90)`).attr('x', 0).attr('y', 0).attr('fill', 'black').attr('text-anchor', 'middle').style('font-size', '14px').text(yLabelText);
    } catch (e) {
      // fallback
      this.chart.append('text').attr('class', 'y-axis-label').attr('text-anchor', 'middle').attr('transform', 'rotate(-90)').attr('x', -effectiveInnerHeight / 2).attr('y', isHorizontal ? -70 : -40).attr('fill', 'black').style('font-size', '14px').text(yLabelText);
    }

    // Draw box plots
    const boxWidth = categoryScale.bandwidth();

    const boxes = this.chart
      .selectAll('.box')
      .data(boxData)
      .enter()
      .append('g')
      .attr('class', 'box')
      .attr('transform', d =>
        isHorizontal
          ? `translate(0,${categoryScale(d.label)})`
          : `translate(${categoryScale(d.label)},0)`
      );

    if (isHorizontal) {
      // Horizontal whisker lines (whiskerMin to Q1, Q3 to whiskerMax)
      boxes
        .append('line')
        .attr('x1', d => valueScale(d.stats.whiskerMin))
        .attr('x2', d => valueScale(d.stats.q1))
        .attr('y1', boxWidth / 2)
        .attr('y2', boxWidth / 2)
        .attr('stroke', 'black')
        .attr('stroke-width', 1.5);

      boxes
        .append('line')
        .attr('x1', d => valueScale(d.stats.q3))
        .attr('x2', d => valueScale(d.stats.whiskerMax))
        .attr('y1', boxWidth / 2)
        .attr('y2', boxWidth / 2)
        .attr('stroke', 'black')
        .attr('stroke-width', 1.5);

      // T-shapes at whisker ends
      boxes
        .append('line')
        .attr('x1', d => valueScale(d.stats.whiskerMin))
        .attr('x2', d => valueScale(d.stats.whiskerMin))
        .attr('y1', boxWidth * 0.25)
        .attr('y2', boxWidth * 0.75)
        .attr('stroke', 'black')
        .attr('stroke-width', 1.5);

      boxes
        .append('line')
        .attr('x1', d => valueScale(d.stats.whiskerMax))
        .attr('x2', d => valueScale(d.stats.whiskerMax))
        .attr('y1', boxWidth * 0.25)
        .attr('y2', boxWidth * 0.75)
        .attr('stroke', 'black')
        .attr('stroke-width', 1.5);

      // Horizontal IQR box (Q1 to Q3 with median)
      boxes
        .append('rect')
        .attr('x', d => valueScale(d.stats.q1))
        .attr('y', 0)
        .attr('width', d => valueScale(d.stats.q3) - valueScale(d.stats.q1))
        .attr('height', boxWidth)
        .attr('fill', d => d.color)
        .attr('stroke', 'black')
        .attr('stroke-width', 1.5)
        .style('opacity', 1);

      // Horizontal median line
      boxes
        .append('line')
        .attr('x1', d => valueScale(d.stats.median))
        .attr('x2', d => valueScale(d.stats.median))
        .attr('y1', 0)
        .attr('y2', boxWidth)
        .attr('stroke', 'black')
        .attr('stroke-width', 2);

      // Min points (only if outside whisker range)
      boxes.each(function (d) {
        if (d.stats.min < d.stats.whiskerMin) {
          d3.select(this)
            .append('circle')
            .attr('cx', valueScale(d.stats.min))
            .attr('cy', boxWidth / 2)
            .attr('r', 4)
            .attr('fill', 'black')
            .attr('stroke', 'white')
            .attr('stroke-width', 1);
        }
      });

      // Max points (only if outside whisker range)
      boxes.each(function (d) {
        if (d.stats.max > d.stats.whiskerMax) {
          d3.select(this)
            .append('circle')
            .attr('cx', valueScale(d.stats.max))
            .attr('cy', boxWidth / 2)
            .attr('r', 4)
            .attr('fill', 'black')
            .attr('stroke', 'white')
            .attr('stroke-width', 1);
        }
      });

      // Outlier points
      boxes.each(function (d) {
        d.stats.outliers.forEach(outlier => {
          d3.select(this)
            .append('circle')
            .attr('cx', valueScale(outlier))
            .attr('cy', boxWidth / 2)
            .attr('r', 4)
            .attr('fill', 'black')
            .style('opacity', 1);
        });
      });
    } else {
      // Vertical whisker lines (whiskerMin to Q1, Q3 to whiskerMax)
      boxes
        .append('line')
        .attr('x1', boxWidth / 2)
        .attr('x2', boxWidth / 2)
        .attr('y1', d => valueScale(d.stats.whiskerMax))
        .attr('y2', d => valueScale(d.stats.q3))
        .attr('stroke', 'black')
        .attr('stroke-width', 1.5);

      boxes
        .append('line')
        .attr('x1', boxWidth / 2)
        .attr('x2', boxWidth / 2)
        .attr('y1', d => valueScale(d.stats.q1))
        .attr('y2', d => valueScale(d.stats.whiskerMin))
        .attr('stroke', 'black')
        .attr('stroke-width', 1.5);

      // T-shapes at whisker ends
      boxes
        .append('line')
        .attr('x1', boxWidth * 0.25)
        .attr('x2', boxWidth * 0.75)
        .attr('y1', d => valueScale(d.stats.whiskerMax))
        .attr('y2', d => valueScale(d.stats.whiskerMax))
        .attr('stroke', 'black')
        .attr('stroke-width', 1.5);

      boxes
        .append('line')
        .attr('x1', boxWidth * 0.25)
        .attr('x2', boxWidth * 0.75)
        .attr('y1', d => valueScale(d.stats.whiskerMin))
        .attr('y2', d => valueScale(d.stats.whiskerMin))
        .attr('stroke', 'black')
        .attr('stroke-width', 1.5);

      // Vertical IQR box (Q1 to Q3 with median)
      boxes
        .append('rect')
        .attr('x', 0)
        .attr('y', d => valueScale(d.stats.q3))
        .attr('width', boxWidth)
        .attr('height', d => valueScale(d.stats.q1) - valueScale(d.stats.q3))
        .attr('fill', d => d.color)
        .attr('stroke', 'black')
        .attr('stroke-width', 1.5)
        .style('opacity', 1);

      // Vertical median line
      boxes
        .append('line')
        .attr('x1', 0)
        .attr('x2', boxWidth)
        .attr('y1', d => valueScale(d.stats.median))
        .attr('y2', d => valueScale(d.stats.median))
        .attr('stroke', 'black')
        .attr('stroke-width', 2);

      // Min points (only if outside whisker range)
      boxes.each(function (d) {
        if (d.stats.min < d.stats.whiskerMin) {
          d3.select(this)
            .append('circle')
            .attr('cx', boxWidth / 2)
            .attr('cy', valueScale(d.stats.min))
            .attr('r', 4)
            .attr('fill', 'black')
            .attr('stroke', 'white')
            .attr('stroke-width', 1);
        }
      });

      // Max points (only if outside whisker range)
      boxes.each(function (d) {
        if (d.stats.max > d.stats.whiskerMax) {
          d3.select(this)
            .append('circle')
            .attr('cx', boxWidth / 2)
            .attr('cy', valueScale(d.stats.max))
            .attr('r', 4)
            .attr('fill', 'black')
            .attr('stroke', 'white')
            .attr('stroke-width', 1);
        }
      });

      // Outlier points
      boxes.each(function (d) {
        d.stats.outliers.forEach(outlier => {
          d3.select(this)
            .append('circle')
            .attr('cx', boxWidth / 2)
            .attr('cy', valueScale(outlier))
            .attr('r', 4)
            .attr('fill', 'black')
            .style('opacity', 1);
        });
      });
    }

  // (xLabelText and yLabelText are declared earlier)

  // (x-axis label is appended above alongside the axis group)

  // (y-axis label was appended earlier on the left axis group)

    // Save font settings for tooltip handlers
    const fontFamily = this.options.fontFamily;
    const fontSize = this.options.fontSize;

  // Add tooltips: prefer compiled this.tooltip (from base class) then evaluate options.tooltip
  var tooltipFormatter = (typeof this.tooltip === 'function') ? this.tooltip : (this.options && this.options.tooltip ? maybeEvalJSFormatter(this.options.tooltip) : null);

    boxes
      .on('mouseover', function (event, d) {
  const rect = d3.select(this).select('rect');
  const highlightColor = getHighlightColor(rect.attr('fill'));
  rect.attr('fill', highlightColor);

        if (tooltipFormatter) {
          try {
            const content = tooltipFormatter(null, { group: d.group, label: d.label || d.group, stats: d.stats });
            showTooltip(event, content, fontFamily, fontSize);
          } catch (e) {
            const tooltipContent =
              `<strong>${escapeHtml(d.label || d.group)}</strong>` +
              `Percentile 0th (Min): ${d.stats.min.toFixed(2)}<br/>` +
              `Percentile 25th: ${d.stats.q1.toFixed(2)}<br/>` +
              `Percentile 50th (Median): ${d.stats.median.toFixed(2)}<br/>` +
              `Percentile 75th: ${d.stats.q3.toFixed(2)}<br/>` +
              `Percentile 100th (Max): ${d.stats.max.toFixed(2)}<br/>` +
              `Outliers: ${d.stats.outliers.length}`;
            showTooltip(event, tooltipContent, fontFamily, fontSize);
          }
        } else {
          const tooltipContent =
            `<strong>${d.label || d.group}</strong>` +
            `Percentile 0th (Min): ${d.stats.min.toFixed(2)}<br/>` +
            `Percentile 25th: ${d.stats.q1.toFixed(2)}<br/>` +
            `Percentile 50th (Median): ${d.stats.median.toFixed(2)}<br/>` +
            `Percentile 75th: ${d.stats.q3.toFixed(2)}<br/>` +
            `Percentile 100th (Max): ${d.stats.max.toFixed(2)}<br/>` +
            `Outliers: ${d.stats.outliers.length}`;

          showTooltip(event, tooltipContent, fontFamily, fontSize);
        }
      })
      .on('mouseout', function (event, d) {
        d3.select(this).select('rect').attr('fill', d.color);
        hideTooltip();
      });

    return this;
  }
}
