import * as d3 from 'd3';
import D3po from '../D3po.js';
import {
  validateData,
  createColorScale,
  showTooltip,
  hideTooltip,
} from '../utils.js';

/**
 * Bar chart visualization
 * @augments D3po
 */
export default class BarChart extends D3po {
  /**
   * Creates a bar chart
   * @param {string|HTMLElement} container - Container selector or element
   * @param {object} options - Configuration options
   * @param {string} options.x - X-axis field name
   * @param {string} options.y - Y-axis field name
   * @param {string} [options.color] - Color field name
   */
  constructor(container, options) {
    super(container, options);

    if (!options.x || !options.y) {
      throw new Error('Bar chart requires x and y fields');
    }

    this.xField = options.x;
    this.yField = options.y;
    this.colorField = options.color;
  }

  /**
   * Renders the bar chart
   * @returns {BarChart} This instance for chaining
   */
  render() {
    if (!this.data) {
      throw new Error('No data provided');
    }

    validateData(this.data, [this.xField, this.yField]);

    // Determine if we need horizontal bars (when y-field is categorical)
    const firstItem = this.data[0];
    const isHorizontal = typeof firstItem[this.yField] === 'string';

    // Create scales based on orientation
    let xScale, yScale;

    if (isHorizontal) {
      // Horizontal bars: x is numeric, y is categorical
      xScale = d3
        .scaleLinear()
        .domain([0, d3.max(this.data, d => d[this.xField])])
        .nice()
        .range([0, this.getInnerWidth()]);

      yScale = d3
        .scaleBand()
        .domain(this.data.map(d => d[this.yField]))
        .range([0, this.getInnerHeight()])
        .padding(0.2);
    } else {
      // Vertical bars: x is categorical, y is numeric
      xScale = d3
        .scaleBand()
        .domain(this.data.map(d => d[this.xField]))
        .range([0, this.getInnerWidth()])
        .padding(0.2);

      yScale = d3
        .scaleLinear()
        .domain([0, d3.max(this.data, d => d[this.yField])])
        .nice()
        .range([this.getInnerHeight(), 0]);
    }

    // Color scale
    const colorScale = createColorScale(
      this.data,
      this.colorField,
      d3.interpolateViridis
    );

    // Capture field names for tooltip
    const xField = this.xField;
    const yField = this.yField;

    // Draw bars FIRST
    const bars = this.chart
      .selectAll('.bar')
      .data(this.data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('fill', colorScale)
      .style('opacity', 1);

    if (isHorizontal) {
      // Horizontal bars
      bars
        .attr('x', 0)
        .attr('y', d => yScale(d[yField]))
        .attr('width', d => xScale(d[xField]))
        .attr('height', yScale.bandwidth());
    } else {
      // Vertical bars
      bars
        .attr('x', d => xScale(d[xField]))
        .attr('y', d => yScale(d[yField]))
        .attr('width', xScale.bandwidth())
        .attr('height', d => this.getInnerHeight() - yScale(d[yField]));
    }

    bars
      .on('mouseover', function (event, d) {
        const color = d3.color(d3.select(this).attr('fill'));
        // For light colors, darken instead of brighten
        const luminance =
          0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b;
        const highlightColor =
          luminance > 180 ? color.darker(0.3) : color.brighter(0.5);
        d3.select(this).attr('fill', highlightColor);

        showTooltip(
          event,
          `<strong>${d[isHorizontal ? yField : xField]}</strong>` +
            `${isHorizontal ? xField : yField}: ${d[isHorizontal ? xField : yField]}`
        );
      })
      .on('mouseout', function (event, d) {
        d3.select(this).attr('fill', colorScale(d));
        hideTooltip();
      });

    // Add axes AFTER bars so they appear on top
    if (isHorizontal) {
      this.chart
        .append('g')
        .attr('transform', `translate(0,${this.getInnerHeight()})`)
        .call(d3.axisBottom(xScale));

      this.chart.append('g').call(d3.axisLeft(yScale));
    } else {
      this.chart
        .append('g')
        .attr('transform', `translate(0,${this.getInnerHeight()})`)
        .call(d3.axisBottom(xScale))
        .selectAll('text')
        .attr('transform', 'rotate(-45)')
        .style('text-anchor', 'end');

      this.chart.append('g').call(d3.axisLeft(yScale));
    }

    // Add axis labels AFTER axes
    this.chart
      .append('text')
      .attr('class', 'x-axis-label')
      .attr('text-anchor', 'middle')
      .attr('x', this.getInnerWidth() / 2)
      .attr('y', this.getInnerHeight() + (isHorizontal ? 45 : 65))
      .attr('fill', 'black')
      .style('font-size', '14px')
      .text(this.xField);

    this.chart
      .append('text')
      .attr('class', 'y-axis-label')
      .attr('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')
      .attr('x', -this.getInnerHeight() / 2)
      .attr('y', isHorizontal ? -70 : -40)
      .attr('fill', 'black')
      .style('font-size', '14px')
      .text(this.yField);

    return this;
  }
}
