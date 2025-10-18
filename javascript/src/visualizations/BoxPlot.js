import * as d3 from 'd3';
import D3po from '../D3po.js';
import {
  validateData,
  groupBy,
  calculateBoxStats,
  showTooltip,
  hideTooltip,
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

    const grouped = groupBy(this.data, categoryField);
    const boxData = Object.entries(grouped).map(([key, values]) => ({
      group: key,
      stats: calculateBoxStats(values.map(d => d[valueField])),
      color: this.colorField
        ? values[0][this.colorField]
        : d3.schemeCategory10[0],
    }));

    // Create scales based on orientation
    let categoryScale, valueScale;

    if (isHorizontal) {
      // Horizontal: y is categorical, x is numeric
      categoryScale = d3
        .scaleBand()
        .domain(boxData.map(d => d.group))
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
        .domain(boxData.map(d => d.group))
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

    // Add axes
    if (isHorizontal) {
      this.chart
        .append('g')
        .attr('transform', `translate(0,${this.getInnerHeight()})`)
        .call(d3.axisBottom(valueScale));

      this.chart.append('g').call(d3.axisLeft(categoryScale));
    } else {
      this.chart
        .append('g')
        .attr('transform', `translate(0,${this.getInnerHeight()})`)
        .call(d3.axisBottom(categoryScale))
        .selectAll('text')
        .attr('transform', 'rotate(-45)')
        .style('text-anchor', 'end');

      this.chart.append('g').call(d3.axisLeft(valueScale));
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
          ? `translate(0,${categoryScale(d.group)})`
          : `translate(${categoryScale(d.group)},0)`
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

    // Add axis labels
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

    // Add tooltips
    boxes
      .on('mouseover', function (event, d) {
        const rect = d3.select(this).select('rect');
        const color = d3.color(rect.attr('fill'));
        // For light colors, darken instead of brighten
        const luminance =
          0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b;
        const highlightColor =
          luminance > 180 ? color.darker(0.3) : color.brighter(0.5);
        rect.attr('fill', highlightColor);

        const tooltipContent =
          `<strong>${d.group}</strong>` +
          `Percentile 0th (Min): ${d.stats.min.toFixed(2)}<br/>` +
          `Percentile 25th: ${d.stats.q1.toFixed(2)}<br/>` +
          `Percentile 50th (Median): ${d.stats.median.toFixed(2)}<br/>` +
          `Percentile 75th: ${d.stats.q3.toFixed(2)}<br/>` +
          `Percentile 100th (Max): ${d.stats.max.toFixed(2)}<br/>` +
          `Outliers: ${d.stats.outliers.length}`;

        showTooltip(event, tooltipContent);
      })
      .on('mouseout', function (event, d) {
        d3.select(this).select('rect').attr('fill', d.color);
        hideTooltip();
      });

    return this;
  }
}
