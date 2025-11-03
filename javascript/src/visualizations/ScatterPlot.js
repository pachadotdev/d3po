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
  createColorScale,
  renderAxes,
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

    // Render axes with consistent font application and spacing
    renderAxes(
      this.chart,
      xScale,
      yScale,
      this.getInnerWidth(),
      this.getInnerHeight(),
      this.options,
      this.xField,
      this.yField,
      this.yLabelGap !== undefined ? this.yLabelGap : 12,
      maxTickWidth,
      labelBBoxHeight
    );

    // Capture field names for use in event handlers
    const xField = this.xField;
    const yField = this.yField;
    const sizeField = this.sizeField;
    const groupField = this.groupField;

    // Create color scale
    const colorScale = createColorScale(
      this.data,
      this.colorField,
      d3.interpolateViridis
    );

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
      .each(function (d) {
        // Store original radius and color on the element
        d._originalRadius = sizeField ? sizeScale(d[sizeField]) : 5;
        d._originalColor = colorScale(d);
      })
      .attr('fill', d => colorScale(d))
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
