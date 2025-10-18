import * as d3 from 'd3';
import D3po from '../D3po.js';
import { validateData, showTooltip, hideTooltip } from '../utils.js';

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

    // Create scales
    const xScale = d3
      .scaleLinear()
      .domain(d3.extent(this.data, d => d[this.xField]))
      .nice()
      .range([0, this.getInnerWidth()]);

    const yScale = d3
      .scaleLinear()
      .domain(d3.extent(this.data, d => d[this.yField]))
      .nice()
      .range([this.getInnerHeight(), 0]);

    // Size scale
    const sizeScale = this.sizeField
      ? d3
          .scaleSqrt()
          .domain(d3.extent(this.data, d => d[this.sizeField]))
          .range([3, 20])
      : () => 5;

    // Add axes
    this.chart
      .append('g')
      .attr('transform', `translate(0,${this.getInnerHeight()})`)
      .call(d3.axisBottom(xScale));

    this.chart.append('g').call(d3.axisLeft(yScale));

    // Add axis labels
    this.chart
      .append('text')
      .attr('class', 'x-axis-label')
      .attr('text-anchor', 'middle')
      .attr('x', this.getInnerWidth() / 2)
      .attr('y', this.getInnerHeight() + 40)
      .attr('fill', 'black')
      .style('font-size', '14px')
      .text(this.xField);

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

    // Capture field names for use in event handlers
    const xField = this.xField;
    const yField = this.yField;
    const sizeField = this.sizeField;
    const groupField = this.groupField;

    // Draw points
    this.chart
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
      .style('opacity', 1)
      .on('mouseover', function (event, d) {
        const color = d3.color(d._originalColor);
        // For light colors, darken instead of brighten
        const luminance =
          0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b;
        const highlightColor =
          luminance > 180 ? color.darker(0.3) : color.brighter(0.5);
        d3.select(this)
          .raise()
          .attr('r', d._originalRadius * 2.0)
          .attr('fill', highlightColor);

        showTooltip(
          event,
          (groupField ? `<strong>${d[groupField]}</strong>` : '') +
            `${xField}: ${d[xField].toFixed(2)}<br/>` +
            `${yField}: ${d[yField].toFixed(2)}` +
            (sizeField ? `<br/>Size: ${d[sizeField].toFixed(2)}` : '')
        );
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
