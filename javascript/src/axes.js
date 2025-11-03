/**
 * Axis rendering utilities for d3po visualizations
 * @module axes
 */

import * as d3 from 'd3';

/**
 * Renders axes with consistent font application and spacing
 * @param {object} chart - The D3 chart group selection
 * @param {object} xScale - The x scale
 * @param {object} yScale - The y scale
 * @param {number} innerWidth - Inner width of the chart
 * @param {number} innerHeight - Inner height of the chart
 * @param {object} options - Chart options including font settings
 * @param {string} xField - X field name for default label
 * @param {string} yField - Y field name for default label
 * @param {number} yLabelGap - Gap between y-axis ticks and label (default: 12)
 * @param {number} measuredMaxTickWidth - Pre-measured max tick width for y-axis
 * @param {number} measuredLabelBBoxHeight - Pre-measured label bbox height
 * @returns {object} Object with xAxisGroup and yAxisGroup selections
 */
export function renderAxes(
  chart,
  xScale,
  yScale,
  innerWidth,
  innerHeight,
  options,
  xField,
  yField,
  yLabelGap = 12,
  measuredMaxTickWidth = 0,
  measuredLabelBBoxHeight = 14
) {
  // Create axis generators
  let xAxis = d3.axisBottom(xScale);
  let yAxis = d3.axisLeft(yScale);

  // Apply formatters if available
  if (options.axisFormatters && options.axisFormatters.x) {
    xAxis.tickFormat(options.axisFormatters.x);
  }
  if (options.axisFormatters && options.axisFormatters.y) {
    yAxis.tickFormat(options.axisFormatters.y);
  }

  // Append x-axis
  const xg = chart
    .append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0,${innerHeight})`)
    .call(xAxis);

  // Apply font settings to x-axis ticks
  xg.selectAll('text')
    .style('font-family', options.fontFamily)
    .style('font-size', `${options.fontSize}px`);
  if (options.textTransform) {
    xg.selectAll('text').style('text-transform', options.textTransform);
  }

  // Measure x-axis tick labels and determine if rotation is needed
  let maxTickHeight = 0;
  let maxTickWidth = 0;
  let rotateX = false;
  try {
    const xTicks = xg.selectAll('.tick text').nodes();
    if (xTicks && xTicks.length) {
      maxTickWidth = d3.max(xTicks, n => n.getBBox().width) || 0;
      maxTickHeight = d3.max(xTicks, n => n.getBBox().height) || 0;

      // Determine if rotation is needed
      if (xScale.bandwidth) {
        const bw = xScale.bandwidth();
        if (maxTickWidth > bw * 0.9) rotateX = true;
      } else if (xTicks.length > 0) {
        const avgSpace = Math.max(10, innerWidth / xTicks.length);
        if (maxTickWidth > avgSpace * 0.9) rotateX = true;
      }

      if (rotateX) {
        xg.selectAll('text')
          .attr('transform', 'rotate(-45)')
          .style('text-anchor', 'end');
      }
    }
  } catch (e) {
    // Ignore measurement errors
  }

  // Add x-axis label with dynamic spacing based on tick label size
  // For rotated labels, we need to account for the full diagonal extent of the rotated text
  // For non-rotated labels, just use the height
  const effectiveTickExtent = rotateX
    ? Math.max(25, maxTickWidth * 0.85) // Use most of the width since labels are rotated
    : Math.max(8, maxTickHeight);

  // Calculate label position with proper spacing
  const tickToLabelGap = 10; // Gap between tick labels and axis label
  const baseTickLabelPadding = rotateX ? 20 : 16; // Base padding for tick labels

  const xLabelY =
    innerHeight + effectiveTickExtent + tickToLabelGap + baseTickLabelPadding;

  const xLabelText = options.xLabel || (xField ? String(xField) : '');

  chart
    .append('text')
    .attr('class', 'x-axis-label')
    .attr('text-anchor', 'middle')
    .attr('x', innerWidth / 2)
    .attr('y', xLabelY)
    .style('font-family', options.fontFamily)
    .style('font-size', '14px')
    .style('text-transform', options.textTransform || 'none')
    .text(xLabelText); // Append y-axis
  const yg = chart.append('g').attr('class', 'y-axis').call(yAxis);

  // Apply font settings to y-axis ticks
  yg.selectAll('text')
    .style('font-family', options.fontFamily)
    .style('font-size', `${options.fontSize}px`);
  if (options.textTransform) {
    yg.selectAll('text').style('text-transform', options.textTransform);
  }

  // Measure y-axis tick width for label positioning
  let yMaxTickWidth = measuredMaxTickWidth;
  try {
    const yTicks = yg.selectAll('.tick text').nodes();
    if (yTicks && yTicks.length) {
      yMaxTickWidth = Math.max(
        yMaxTickWidth,
        d3.max(yTicks, n => n.getBBox().width) || 0
      );
    }
  } catch (e) {
    // Ignore measurement errors
  }

  // Calculate y-axis label position with proper spacing
  // Gap between tick labels and axis label, plus room for the label itself
  const gap = 8;
  const labelOffset = yMaxTickWidth + gap + 10; // +10 for label height when rotated

  // Add y-axis label
  const yLabelText = options.yLabel || (yField ? String(yField) : '');

  yg.append('text')
    .attr('class', 'y-axis-label')
    .attr(
      'transform',
      `translate(${-labelOffset},${innerHeight / 2}) rotate(-90)`
    )
    .attr('text-anchor', 'middle')
    .style('font-family', options.fontFamily)
    .style('font-size', '14px')
    .style('text-transform', options.textTransform || 'none')
    .text(yLabelText);

  return { xAxisGroup: xg, yAxisGroup: yg };
}
