import * as d3 from 'd3';
import D3po from '../D3po.js';
import { validateData, showTooltip, hideTooltip } from '../utils.js';

/**
 * Area chart visualization
 * @augments D3po
 */
export default class AreaChart extends D3po {
  /**
   * Creates an area chart
   * @param {string|HTMLElement} container - Container selector or element
   * @param {object} options - Configuration options
   * @param {string} options.x - X-axis field name
   * @param {string} options.y - Y-axis field name
   * @param {string} [options.group] - Group field name for multiple areas
   * @param {string} [options.color] - Color field name
   * @param {boolean} [options.stacked] - Whether to stack areas
   */
  constructor(container, options) {
    super(container, options);

    if (!options.x || !options.y) {
      throw new Error('Area chart requires x and y fields');
    }

    this.xField = options.x;
    this.yField = options.y;
    this.groupField = options.group;
    this.colorField = options.color;
    this.stacked = options.stacked || false;
  }

  /**
   * Renders the area chart
   * @returns {AreaChart} This instance for chaining
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

    // Create scales
    const xScale = d3
      .scaleLinear()
      .domain(d3.extent(this.data, d => d[this.xField]))
      .nice()
      .range([0, this.getInnerWidth()]);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(this.data, d => d[this.yField]) * 1.1])
      .nice()
      .range([this.getInnerHeight(), 0]);

    // Add axes
    this.chart
      .append('g')
      .attr('transform', `translate(0,${this.getInnerHeight()})`)
      .call(d3.axisBottom(xScale))
      .append('text')
      .attr('x', this.getInnerWidth() / 2)
      .attr('y', 40)
      .attr('fill', '#000')
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .text(this.xField.charAt(0).toUpperCase() + this.xField.slice(1));

    this.chart
      .append('g')
      .call(d3.axisLeft(yScale))
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -this.getInnerHeight() / 2)
      .attr('y', -50)
      .attr('fill', '#000')
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .text(this.yField.charAt(0).toUpperCase() + this.yField.slice(1));

    // Add grid lines
    this.chart
      .append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(yScale).ticks(6).tickSize(-this.getInnerWidth()).tickFormat(''))
      .attr('opacity', 0.08);

    // Area generator
    const area = d3
      .area()
      .defined(d => d[this.xField] != null && d[this.yField] != null)
      .x(d => xScale(d[this.xField]))
      .y0(this.getInnerHeight())
      .y1(d => yScale(d[this.yField]))
      .curve(d3.curveLinear);

    // Line generator (for the top edge)
    const line = d3
      .line()
      .defined(d => d[this.xField] != null && d[this.yField] != null)
      .x(d => xScale(d[this.xField]))
      .y(d => yScale(d[this.yField]))
      .curve(d3.curveLinear);

    // Color scale
    const colorScale = d3
      .scaleOrdinal(d3.schemeCategory10)
      .domain(series.map((_, i) => i));

    // Draw all areas first (bottom layer)
    series.forEach((data, i) => {
      const color = this.colorField ? data[0][this.colorField] : colorScale(i);

      this.chart
        .append('path')
        .datum(data)
        .attr('class', `area area-${i}`)
        .attr('d', area)
        .attr('fill', color)
        .attr('fill-opacity', 0.3)
        .attr('stroke', 'none');
    });

    // Then draw all lines on top of areas
    series.forEach((data, i) => {
      const color = this.colorField ? data[0][this.colorField] : colorScale(i);

      this.chart
        .append('path')
        .datum(data)
        .attr('class', `line line-${i}`)
        .attr('d', line)
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', 2);
    });

    // Finally draw all points on top (topmost layer)
    series.forEach((data, i) => {
      const color = this.colorField ? data[0][this.colorField] : colorScale(i);
      const groupValue = this.groupField ? data[0][this.groupField] : '';

      this.chart
        .selectAll(`.point-${i}`)
        .data(data)
        .enter()
        .append('circle')
        .attr('class', `point point-${i}`)
        .attr('cx', d => xScale(d[this.xField]))
        .attr('cy', d => yScale(d[this.yField]))
        .attr('r', 4)
        .attr('fill', color)
        .attr('stroke', '#fff')
        .attr('stroke-width', 1.2)
        .on('mouseover', (event, d) => {
          const circle = d3.select(event.currentTarget);
          const colorObj = d3.color(color);
          // For light colors, darken instead of brighten
          const luminance = 0.2126 * colorObj.r + 0.7152 * colorObj.g + 0.0722 * colorObj.b;
          const highlightColor = luminance > 180 ? colorObj.darker(0.3) : colorObj.brighter(0.5);
          
          circle
            .raise()
            .attr('r', 8)
            .attr('fill', highlightColor);

          showTooltip(event,
            (this.groupField && groupValue ? `<strong>${groupValue}</strong>` : '') +
            `${this.xField}: ${d[this.xField]}<br/>` +
            `${this.yField}: ${d[this.yField]}`
          );
        })
        .on('mouseout', (event) => {
          d3.select(event.currentTarget)
            .attr('r', 4)
            .attr('fill', color);
          hideTooltip();
        });
    });

    return this;
  }
}
