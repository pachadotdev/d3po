/**
 * Utility functions for data processing and validation
 * @module utils
 */

import * as d3 from 'd3';

// Inject tooltip CSS styles once
let tooltipStylesInjected = false;

function injectTooltipStyles() {
  if (tooltipStylesInjected) return;

  const style = document.createElement('style');
  style.textContent = `
    .d3po-tooltip {
      position: absolute;
      background: white;
      border: 1px solid #999;
      padding: 8px 10px;
      border-radius: 4px;
      pointer-events: none;
      font-size: 12px;
      line-height: 1.4;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      z-index: 1000;
      max-width: 200px;
    }
    
    .d3po-tooltip::after {
      content: '';
      position: absolute;
      bottom: -6px;
      left: 50%;
      transform: translateX(-50%);
      width: 0;
      height: 0;
      border-left: 6px solid transparent;
      border-right: 6px solid transparent;
      border-top: 6px solid white;
    }
    
    .d3po-tooltip::before {
      content: '';
      position: absolute;
      bottom: -7px;
      left: 50%;
      transform: translateX(-50%);
      width: 0;
      height: 0;
      border-left: 7px solid transparent;
      border-right: 7px solid transparent;
      border-top: 7px solid #999;
    }
    
    .d3po-tooltip strong {
      display: block;
      margin-bottom: 0;
      color: #333;
    }
  `;
  document.head.appendChild(style);
  tooltipStylesInjected = true;
}

/**
 * Creates and shows a tooltip
 * @param {Object} event - Mouse event
 * @param {string} content - HTML content for tooltip
 * @returns {Object} D3 selection of tooltip
 */
export function showTooltip(event, content) {
  injectTooltipStyles();

  // Remove any existing tooltips
  d3.selectAll('.d3po-tooltip').remove();

  const tooltip = d3
    .select('body')
    .append('div')
    .attr('class', 'd3po-tooltip')
    .html(content);

  // Position tooltip above the cursor
  const tooltipNode = tooltip.node();
  const tooltipHeight = tooltipNode.offsetHeight;
  const tooltipWidth = tooltipNode.offsetWidth;

  tooltip
    .style('left', event.pageX - tooltipWidth / 2 + 'px')
    .style('top', event.pageY - tooltipHeight - 15 + 'px');

  return tooltip;
}

/**
 * Hides all tooltips
 */
export function hideTooltip() {
  d3.selectAll('.d3po-tooltip').remove();
}

/**
 * Validates that required fields exist in data
 * @param {Array} data - Array of data objects
 * @param {Array<string>} requiredFields - Array of required field names
 * @throws {Error} If required fields are missing
 */
export function validateData(data, requiredFields) {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('Data must be a non-empty array');
  }

  const firstItem = data[0];
  const missingFields = requiredFields.filter(field => !(field in firstItem));

  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }
}

/**
 * Creates a color scale based on unique values
 * @param {Array} data - Array of data objects
 * @param {string} colorField - Field name for color mapping
 * @param {Function} colorScale - D3 color scale function
 * @returns {Function} Color accessor function
 */
export function createColorScale(data, colorField, colorScale) {
  if (!colorField) return () => colorScale(0);

  const uniqueValues = [...new Set(data.map(d => d[colorField]))];
  const colors = {};

  uniqueValues.forEach((value, i) => {
    colors[value] =
      data.find(d => d[colorField] === value)?.color ||
      colorScale(i / uniqueValues.length);
  });

  return d => colors[d[colorField]] || colorScale(0);
}

/**
 * Formats numbers for display
 * @param {number} value - Number to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted number
 */
export function formatNumber(value, decimals = 2) {
  if (typeof value !== 'number') return value;
  return value.toFixed(decimals);
}

/**
 * Truncates text to fit within width
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export function truncateText(text, maxLength = 20) {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Calculates box plot statistics
 * @param {Array<number>} values - Array of numeric values
 * @returns {Object} Box plot statistics (min, q1, median, q3, max)
 */
export function calculateBoxStats(values) {
  const sorted = values.slice().sort((a, b) => a - b);
  const n = sorted.length;

  const quantile = (arr, p) => {
    const idx = (arr.length - 1) * p;
    const lower = Math.floor(idx);
    const upper = Math.ceil(idx);
    const weight = idx % 1;
    return arr[lower] * (1 - weight) + arr[upper] * weight;
  };

  const q1 = quantile(sorted, 0.25);
  const q3 = quantile(sorted, 0.75);
  const iqr = q3 - q1;

  // Calculate whisker bounds (1.5 * IQR rule)
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;

  // Find min and max within whisker bounds (non-outliers)
  const whiskerMin = sorted.find(v => v >= lowerBound) || sorted[0];
  const whiskerMax = sorted.reverse().find(v => v <= upperBound) || sorted[0];
  sorted.reverse(); // restore order

  // Find outliers
  const outliers = sorted.filter(v => v < lowerBound || v > upperBound);

  return {
    min: sorted[0],
    q1: q1,
    median: quantile(sorted, 0.5),
    q3: q3,
    max: sorted[n - 1],
    whiskerMin: whiskerMin,
    whiskerMax: whiskerMax,
    outliers: outliers,
  };
}

/**
 * Groups data by a field
 * @param {Array} data - Array of data objects
 * @param {string} field - Field to group by
 * @returns {Object} Grouped data object
 */
export function groupBy(data, field) {
  return data.reduce((acc, item) => {
    const key = item[field];
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});
}

/**
 * Helper to trigger a file download
 * @param {Blob} blob - Blob to download
 * @param {string} filename - Filename for download
 */
export function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  
  setTimeout(() => {
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  }, 0);
}

/**
 * Creates a highlight color for interactive elements
 * @param {string} baseColor - Base color string
 * @returns {string} Highlighted color
 */
export function getHighlightColor(baseColor) {
  const color = d3.color(baseColor);
  // For light colors, darken instead of brighten
  const luminance = 0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b;
  return luminance > 180 ? color.darker(0.3) : color.brighter(0.5);
}
