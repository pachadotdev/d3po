import * as d3 from 'd3';
import D3po from '../D3po.js';
import {
  validateData,
  showTooltip,
  hideTooltip,
  getHighlightColor,
  resolveTooltipFormatter,
  showTooltipWithFormatter,
} from '../utils.js';

/**
 * Line chart visualization
 * @augments D3po
 */
export default class LineChart extends D3po {
  /**
   * Creates a line chart
   * @param {string|HTMLElement} container - Container selector or element
   * @param {object} options - Configuration options
   * @param {string} options.x - X-axis field name
   * @param {string} options.y - Y-axis field name
   * @param {string} [options.group] - Group field name for multiple lines
   * @param {string} [options.color] - Color field name
   * @param {boolean} [options.area] - Whether to render as area chart
   * @param {boolean} [options.stacked] - Whether to stack areas
   */
  constructor(container, options) {
    super(container, options);

    if (!options.x || !options.y) {
      throw new Error('Line chart requires x and y fields');
    }

    this.xField = options.x;
    this.yField = options.y;
    this.groupField = options.group;
    this.colorField = options.color;
    this.area = options.area || false;
    this.stacked = options.stacked || false;
  }

  /**
   * Renders the line chart
   * @returns {LineChart} This instance for chaining
   */
  render() {
    if (!this.data) {
      throw new Error('No data provided');
    }

    validateData(this.data, [this.xField, this.yField]);

    // Group data if needed
    let series = [this.data];
    if (this.groupField) {
      const grouped = d3.group(this.data, d => d[this.groupField]);
      series = Array.from(grouped.values());
    }

    // Create provisional yScale (inner height unaffected by left margin)
    const innerHeight =
      this.options.height -
      this.options.margin.top -
      this.options.margin.bottom;
    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(this.data, d => d[this.yField])])
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

    // Compute required left margin to accommodate tick labels + desired gap.
    // Also measure the y-axis label size (height) because when rotated the
    // label's vertical size contributes to how far left it reaches.
    const gap = this.yLabelGap !== undefined ? this.yLabelGap : 12;

    // Create a temporary label to measure its bbox (place it off-canvas)
    let labelBBoxHeight = 0;
    try {
      const probeLabel = this.svg
        .append('text')
        .attr('x', -9999)
        .attr('y', -9999)
        .style('font-size', '14px')
        .text(
          this.options && this.options.yLabel
            ? this.options.yLabel
            : this.yField
              ? String(this.yField)
              : ''
        );
      const lb = probeLabel.node().getBBox();
      labelBBoxHeight = lb.height || 0;
      probeLabel.remove();
    } catch (e) {
      // ignore measurement errors, fall back to small estimate
      labelBBoxHeight = 14;
    }

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

    // Add axes
    var xAxis = d3.axisBottom(xScale);
    if (this.options.axisFormatters && this.options.axisFormatters.x) {
      xAxis.tickFormat(this.options.axisFormatters.x);
    }

    var yAxis = d3.axisLeft(yScale);
    if (this.options.axisFormatters && this.options.axisFormatters.y) {
      yAxis.tickFormat(this.options.axisFormatters.y);
    }

    // Append axes groups so we can measure tick labels and position axis labels
    const xg = this.chart
      .append('g')
      .attr('transform', `translate(0,${this.getInnerHeight()})`)
      .call(xAxis);

    // Measure max tick label height for the x axis
    let maxTickHeight = 0;
    try {
      const xTicks = xg.selectAll('.tick text').nodes();
      if (xTicks && xTicks.length) {
        maxTickHeight = d3.max(xTicks, n => n.getBBox().height) || 0;
      }
    } catch (e) {
      // ignore measurement errors
    }

    const xLabelPadding = Math.max(8, maxTickHeight + 8);
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

    xg.append('text')
      .attr('class', 'x-axis-label')
      .attr('x', this.getInnerWidth() / 2)
      .attr('y', xLabelPadding + 24) // baseline offset plus measured padding
      // color intentionally left to theme/CSS so po_theme can override
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .text(xLabelText);

    const yg = this.chart.append('g').call(yAxis);

    // (y-axis tick widths were measured earlier via probeGroup)

    // Compute target offset: label should sit left of tick labels by `gap` pixels
    const labelGap = this.yLabelGap !== undefined ? this.yLabelGap : 12;
    let labelOffset = maxTickWidth + labelGap;
    // clamp so label does not move outside the left margin (leave 4px padding)
    const marginLeft =
      (this.options && this.options.margin && this.options.margin.left) || 60;
    const maxAllowed = Math.max(10, marginLeft - 4);
    if (labelOffset > maxAllowed) labelOffset = maxAllowed;

    // Place the y label so it sits to the left of tick labels by `labelOffset`.
    // Use translate before rotate so the offset is applied in the unrotated
    // coordinate system and the label reliably appears left of the ticks.
    yg.append('text')
      .attr('class', 'y-axis-label')
      .attr(
        'transform',
        `translate(${-labelOffset},${this.getInnerHeight() / 2}) rotate(-90)`
      )
      .attr('x', 0)
      .attr('y', 0)
      // color intentionally left to theme/CSS so po_theme can override
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .text(yLabelText);

    // Add grid lines
    this.chart
      .append('g')
      .attr('class', 'grid')
      .call(
        d3
          .axisLeft(yScale)
          .ticks(6)
          .tickSize(-this.getInnerWidth())
          .tickFormat('')
      )
      .attr('opacity', 0.08);

    // Line generator
    const line = d3
      .line()
      .x(d => xScale(d[this.xField]))
      .y(d => yScale(d[this.yField]))
      .curve(d3.curveLinear);

    // Area generator
    const area = d3
      .area()
      .x(d => xScale(d[this.xField]))
      .y0(this.getInnerHeight())
      .y1(d => yScale(d[this.yField]))
      .curve(d3.curveLinear);

    // Color scale
    const colorScale = d3
      .scaleOrdinal(d3.schemeCategory10)
      .domain(series.map((_, i) => i));

    // Draw lines/areas
    series.forEach((data, i) => {
      const color = this.colorField ? data[0][this.colorField] : colorScale(i);
      const groupValue = this.groupField ? data[0][this.groupField] : '';

      if (this.area) {
        this.chart
          .append('path')
          .datum(data)
          .attr('class', 'area')
          .attr('d', area)
          .attr('fill', color)
          .style('opacity', 1);
      }

      this.chart
        .append('path')
        .datum(data)
        .attr('class', 'line')
        .attr('d', line)
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', 2);

      // Tooltip formatter
      var tooltipFormatter = resolveTooltipFormatter(
        this.tooltip,
        this.options && this.options.tooltip
      );

      // Add points
      this.chart
        .selectAll(`.point-${i}`)
        .data(data)
        .enter()
        .append('circle')
        .attr('class', `point-${i}`)
        .attr('cx', d => xScale(d[this.xField]))
        .attr('cy', d => yScale(d[this.yField]))
        .attr('r', 4)
        .attr('fill', color)
        .attr('stroke', '#fff')
        .attr('stroke-width', 1.2)
        .on('mouseover', (event, d) => {
          const circle = d3.select(event.currentTarget);
          const highlightColor = getHighlightColor(color);
          circle.raise().attr('r', 8).attr('fill', highlightColor);

          if (tooltipFormatter) {
            const fallback = () =>
              (this.groupField && groupValue
                ? `<strong>${groupValue}</strong>`
                : '') +
              `${this.xField}: ${d[this.xField]}<br/>` +
              `${this.yField}: ${d[this.yField]}`;
            showTooltipWithFormatter(
              event,
              tooltipFormatter,
              null,
              d,
              this.options.fontFamily,
              this.options.fontSize,
              fallback
            );
          } else {
            showTooltip(
              event,
              (this.groupField && groupValue
                ? `<strong>${groupValue}</strong>`
                : '') +
                `${this.xField}: ${d[this.xField]}<br/>` +
                `${this.yField}: ${d[this.yField]}`,
              this.options.fontFamily,
              this.options.fontSize
            );
          }
        })
        .on('mouseout', event => {
          d3.select(event.currentTarget).attr('r', 4).attr('fill', color);
          hideTooltip();
        });
    });

    return this;
  }
}
