import * as d3 from 'd3';
import D3po from '../D3po.js';
import {
  validateData,
  showTooltip,
  hideTooltip,
  escapeHtml,
  getHighlightColor,
  resolveTooltipFormatter,
  showTooltipWithFormatter,
} from '../utils.js';

/**
 * Scatter plot visualization
 * @augments D3po
 */
export default class ScatterPlot extends D3po {
  /**
   * Creates a scatter plot
   * @param {string|HTMLElement} container - Container selector or element
   * @param {object} options - Configuration options
   * @param {string} options.x - X-axis field name
   * @param {string} options.y - Y-axis field name
   * @param {string} [options.size] - Size field name
   * @param {string} [options.group] - Group field name
   * @param {string} [options.color] - Color field name
   */
  constructor(container, options) {
    super(container, options);

    if (!options.x || !options.y) {
      throw new Error('Scatter plot requires x and y fields');
    }

    this.xField = options.x;
    this.yField = options.y;
    this.sizeField = options.size;
    this.groupField = options.group;
    this.colorField = options.color;
  }

  /**
   * Renders the scatter plot
   * @returns {ScatterPlot} This instance for chaining
   */
  render() {
    if (!this.data) {
      throw new Error('No data provided');
    }

    validateData(this.data, [this.xField, this.yField]);

    // Create provisional yScale (inner height unaffected by left margin)
    const innerHeight =
      this.options.height -
      this.options.margin.top -
      this.options.margin.bottom;
    const yScale = d3
      .scaleLinear()
      .domain(d3.extent(this.data, d => d[this.yField]))
      .nice()
      .range([innerHeight, 0]);

    // Measure y-axis tick widths using a temporary off-DOM group so we can
    // calculate how much left margin we need to reserve for the label + ticks.
    const yAxisProbe = d3.axisLeft(yScale);
    if (this.options.axisFormatters && this.options.axisFormatters.y) {
      yAxisProbe.tickFormat(this.options.axisFormatters.y);
    }

    // Create a temporary group at the top-left of the svg (not translated by
    // margin.left) for measuring tick labels, then remove it.
    const probeGroup = this.svg.append('g').attr('class', 'd3po-probe-group');
    probeGroup.call(yAxisProbe);

    // Measure max tick label width for the y axis from the probe
    let maxTickWidth = 0;
    try {
      const yTicksProbe = probeGroup.selectAll('.tick text').nodes();
      if (yTicksProbe && yTicksProbe.length) {
        maxTickWidth = d3.max(yTicksProbe, n => n.getBBox().width) || 0;
      }
    } catch (e) {
      // ignore measurement errors
    }

    // Remove the probe group
    probeGroup.remove();

    // Measure rotated label bbox (off-canvas) because rotated label height
    // contributes to how far left it reaches when placed.
    let labelBBoxHeight = 0;
    try {
      const probeLabel = this.svg
        .append('text')
        .attr('x', -9999)
        .attr('y', -9999)
        .style('font-size', '14px')
        .text(this.yField);
      const lb = probeLabel.node().getBBox();
      labelBBoxHeight = lb.height || 0;
      probeLabel.remove();
    } catch (e) {
      labelBBoxHeight = 14;
    }

    const gap = this.yLabelGap !== undefined ? this.yLabelGap : 12;
    const requiredLeft = Math.ceil(maxTickWidth + gap + labelBBoxHeight + 8); // extra safety padding
    const currentLeft =
      (this.options && this.options.margin && this.options.margin.left) || 60;
    let usedLeft = Math.max(currentLeft, requiredLeft);

    // If we need to expand left margin, update options so getInnerWidth() uses it
    if (usedLeft !== currentLeft) {
      this.options.margin.left = usedLeft;
      // Move the main chart group so all chart content shifts right to make room
      // for the y-axis tick labels and the y-axis label.
      try {
        if (this.chart && this.chart.attr) {
          this.chart.attr(
            'transform',
            `translate(${this.options.margin.left},${this.options.margin.top})`
          );
        }
      } catch (e) {
        // ignore if chart isn't available or transform fails
      }
    }

    // Now create xScale using (possibly) updated left margin
    const xScale = d3
      .scaleLinear()
      .domain(d3.extent(this.data, d => d[this.xField]))
      .nice()
      .range([0, this.getInnerWidth()]);

    // Update yScale range to reflect actual innerHeight (unchanged) and keep it
    // consistent with previously used innerHeight
    yScale.range([this.getInnerHeight(), 0]);

    // Size scale
    const sizeScale = this.sizeField
      ? d3
          .scaleSqrt()
          .domain(d3.extent(this.data, d => d[this.sizeField]))
          .range([3, 20])
      : () => 5;

    // Add axes
    // Apply axis formatters if available
    var xAxis = d3.axisBottom(xScale);
    if (this.options.axisFormatters && this.options.axisFormatters.x) {
      xAxis.tickFormat(this.options.axisFormatters.x);
    }

    var yAxis = d3.axisLeft(yScale);
    if (this.options.axisFormatters && this.options.axisFormatters.y) {
      yAxis.tickFormat(this.options.axisFormatters.y);
    }

    // axes will be appended below with measurement-aware placement

    // Place axes groups and labels — measure tick sizes to avoid overlaps (follow AreaChart/BarChart logic)
    const xg = this.chart
      .append('g')
      .attr('transform', `translate(0,${this.getInnerHeight()})`)
      .call(xAxis);

    // Measure max tick label height for the x axis to position the label
    let maxTickHeight = 0;
    try {
      const xTicks = xg.selectAll('.tick text').nodes();
      if (xTicks && xTicks.length) {
        maxTickHeight = d3.max(xTicks, n => n.getBBox().height) || 0;
      }
    } catch (e) {
      /* ignore measurement errors */
    }
    const xLabelPadding = Math.max(8, maxTickHeight + 8);
    // Resolve axis label text: allow options.xLabel / options.yLabel overrides
    const xLabelText =
      this.options && this.options.xLabel
        ? this.options.xLabel
        : this.xField
          ? String(this.xField)
          : '';
    const yLabelText =
      this.options && this.options.yLabel
        ? this.options.yLabel
        : this.yField
          ? String(this.yField)
          : '';

    this.chart
      .append('text')
      .attr('class', 'x-axis-label')
      .attr('x', this.getInnerWidth() / 2)
      .attr('y', this.getInnerHeight() + xLabelPadding + 24)
      .attr('fill', 'black')
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .text(xLabelText);

    const yg = this.chart.append('g').call(yAxis);

    // Measure y-axis tick width and label bbox to place rotated y label without overlap
    try {
      const yTicks = yg.selectAll('.tick text').nodes();
      const yMaxTickWidth =
        yTicks && yTicks.length ? d3.max(yTicks, n => n.getBBox().width) : 0;

      // measure label bbox height (off-canvas)
      let measuredLabelBBoxHeight = 14;
      try {
        const lab = this.svg
          .append('text')
          .attr('x', -9999)
          .attr('y', -9999)
          .style('font-size', '14px')
          .text(this.yField);
        measuredLabelBBoxHeight = lab.node().getBBox().height || 14;
        lab.remove();
      } catch (e) {
        measuredLabelBBoxHeight = 14;
      }

      const labelGap = this.yLabelGap !== undefined ? this.yLabelGap : 12;
      const labelBaseline = Math.max(
        yMaxTickWidth + labelGap,
        measuredLabelBBoxHeight + labelGap
      );
      const adaptivePadding = Math.min(
        36,
        Math.max(4, Math.round(yMaxTickWidth * 0.08))
      );
      let labelOffset = labelBaseline + adaptivePadding + 10;

      const measuredRequiredLeft =
        yMaxTickWidth > 0
          ? Math.ceil(yMaxTickWidth + labelGap + measuredLabelBBoxHeight + 8)
          : null;
      const marginLeft =
        (this.options && this.options.margin && this.options.margin.left) || 60;
      let maxAllowed = marginLeft - 4;
      if (measuredRequiredLeft != null)
        maxAllowed = Math.max(10, Math.min(maxAllowed, measuredRequiredLeft));
      else maxAllowed = Math.max(10, maxAllowed);
      if (labelOffset > maxAllowed) labelOffset = maxAllowed;

      yg.append('text')
        .attr(
          'transform',
          `translate(${-labelOffset},${this.getInnerHeight() / 2}) rotate(-90)`
        )
        .attr('x', 0)
        .attr('y', 0)
        .attr('fill', 'black')
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .text(yLabelText);
    } catch (e) {
      // fallback placement
      this.chart
        .append('text')
        .attr('class', 'y-axis-label')
        .attr('text-anchor', 'middle')
        .attr('transform', 'rotate(-90)')
        .attr('x', -this.getInnerHeight() / 2)
        .attr('y', -40)
        .attr('fill', 'black')
        .style('font-size', '14px')
        .text(this.yField);
    }

    // Capture field names for use in event handlers
    const xField = this.xField;
    const yField = this.yField;
    const sizeField = this.sizeField;
    const groupField = this.groupField;

    // Draw points
    const circles = this.chart
      .selectAll('.point')
      .data(this.data)
      .enter()
      .append('circle')
      .attr('class', 'point')
      .attr('cx', d => xScale(d[xField]))
      .attr('cy', d => yScale(d[yField]))
      .attr('r', d => (sizeField ? sizeScale(d[sizeField]) : 5))
      .each(
        function (d) {
          // Store original radius and color on the element
          d._originalRadius = sizeField ? sizeScale(d[sizeField]) : 5;
          d._originalColor = this.colorField
            ? d[this.colorField]
            : d3.interpolateViridis(Math.random());
        }.bind(this)
      )
      .attr('fill', d =>
        this.colorField
          ? d[this.colorField]
          : d3.interpolateViridis(Math.random())
      )
      .attr('stroke', 'white')
      .attr('stroke-width', 1)
      .style('opacity', 1);

    // Save font settings for tooltip handlers
    const fontFamily = this.options.fontFamily;
    const fontSize = this.options.fontSize;
    // Determine tooltip formatter/template: prefer compiled this.tooltip from base class
    var tooltipFormatter = resolveTooltipFormatter(
      this.tooltip,
      this.options && this.options.tooltip
    );

    const maybeFormat = v =>
      typeof v === 'number' && Number.isFinite(v) ? v.toFixed(2) : v;

    circles
      .on('mouseover', function (event, d) {
        const highlightColor = getHighlightColor(d._originalColor);
        d3.select(this)
          .raise()
          .attr('r', d._originalRadius * 2.0)
          .attr('fill', highlightColor);

        // If user provided a tooltip formatter, call it (AreaChart uses tooltipFormatter(null, row))
        if (tooltipFormatter) {
          const fallback = () => {
            const prefix =
              groupField && d && d[groupField]
                ? `<strong>${escapeHtml(String(d[groupField]))}</strong>`
                : '';
            return (
              prefix +
              `${escapeHtml(String(xField))}: ${escapeHtml(String(maybeFormat(d[xField])))}<br/>` +
              `${escapeHtml(String(yField))}: ${escapeHtml(String(maybeFormat(d[yField])))}` +
              (sizeField
                ? `<br/>size: ${escapeHtml(String(maybeFormat(d[sizeField])))}`
                : '')
            );
          };
          showTooltipWithFormatter(
            event,
            tooltipFormatter,
            null,
            d,
            fontFamily,
            fontSize,
            fallback
          );
        } else {
          const prefix =
            groupField && d && d[groupField]
              ? `<strong>${escapeHtml(String(d[groupField]))}</strong>`
              : '';
          const content =
            prefix +
            `${escapeHtml(String(xField))}: ${escapeHtml(String(maybeFormat(d[xField])))}<br/>` +
            `${escapeHtml(String(yField))}: ${escapeHtml(String(maybeFormat(d[yField])))}` +
            (sizeField
              ? `<br/>size: ${escapeHtml(String(maybeFormat(d[sizeField])))}`
              : '');
          showTooltip(event, content, fontFamily, fontSize);
        }
      })
      .on('mouseout', function (event, d) {
        d3.select(this)
          .attr('r', d._originalRadius)
          .attr('fill', d._originalColor);
        hideTooltip();
      });

    return this;
  }
}
