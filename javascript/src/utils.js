/**
 * Utility functions for data processing and validation
 * @module utils
 */

import * as d3 from 'd3';

// Inject tooltip CSS styles once
let tooltipStylesInjected = false;
let currentTooltipFont = null;

function injectTooltipStyles(fontFamily, fontSize) {
  // If font changed, remove old styles
  const newFont = `${fontFamily}-${fontSize}`;
  if (tooltipStylesInjected && currentTooltipFont === newFont) return;

  // Remove old style if exists
  const oldStyle = document.getElementById('d3po-tooltip-styles');
  if (oldStyle) {
    oldStyle.remove();
  }

  const style = document.createElement('style');
  style.id = 'd3po-tooltip-styles';
  style.textContent = `
    .d3po-tooltip {
      position: absolute;
      background: white;
      border: 1px solid #999;
      padding: 8px 10px;
      border-radius: 4px;
      pointer-events: none;
      font-family: ${fontFamily || '"Noto Sans", "Fira Sans", sans-serif'};
      font-size: ${fontSize || 12}px;
      line-height: 1.6;
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
      margin-bottom: 4px;
      color: #333;
    }
  `;
  document.head.appendChild(style);
  tooltipStylesInjected = true;
  currentTooltipFont = newFont;
}
/**
 * Creates and shows a tooltip
 * @param {Object} event - Mouse event
 * @param {string} content - HTML content for tooltip
 * @param {string} fontFamily - Font family to use
 * @param {number} fontSize - Font size to use
 * @returns {Object} D3 selection of tooltip
 */
export function showTooltip(event, content, fontFamily, fontSize) {
  injectTooltipStyles(fontFamily, fontSize);

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
 * Resolve a tooltip formatter given possible sources.
 * Prefer instanceTooltip if it's a function; otherwise try optionsTooltip (string -> maybeEvalJSFormatter).
 * @param {Function|null} instanceTooltip
 * @param {string|Function|null} optionsTooltip
 * @returns {Function|null}
 */
export function resolveTooltipFormatter(instanceTooltip, optionsTooltip) {
  if (typeof instanceTooltip === 'function') return instanceTooltip;
  if (typeof optionsTooltip === 'function') return optionsTooltip;
  if (typeof optionsTooltip === 'string')
    return maybeEvalJSFormatter(optionsTooltip);
  return null;
}

/**
 * Safely call a tooltip formatter and show the tooltip, falling back to the provided fallback when
 * the formatter returns null/undefined or throws.
 * @param {Event} event
 * @param {Function|null} formatter - function(value,row) -> content
 * @param {*} value
 * @param {*} row
 * @param {string} fontFamily
 * @param {number} fontSize
 * @param {Function|string} fallback - either a string or function(value,row) -> string
 */
export function showTooltipWithFormatter(
  event,
  formatter,
  value,
  row,
  fontFamily,
  fontSize,
  fallback
) {
  try {
    if (typeof formatter === 'function') {
      const out = formatter(value, row);
      if (out != null) return showTooltip(event, out, fontFamily, fontSize);
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Tooltip formatter error', err);
  }

  const content =
    typeof fallback === 'function'
      ? fallback(value, row)
      : String(fallback || '');
  return showTooltip(event, content, fontFamily, fontSize);
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
 * Escape HTML for safe insertion into tooltips
 * @param {string} str
 * @returns {string}
 */
export function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Choose a readable text color (black/white) for a given background color
 * @param {string} bgColor - any CSS color accepted by d3.rgb
 * @returns {string} 'black' or 'white'
 */
export function getTextColor(bgColor) {
  try {
    const rgb = d3.rgb(bgColor);
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;
    const [rL, gL, bL] = [r, g, b].map(c =>
      c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    );
    const lum = 0.2126 * rL + 0.7152 * gL + 0.0722 * bL;
    return lum > 0.5 ? 'black' : 'white';
  } catch (e) {
    return 'black';
  }
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

  // handle empty input
  if (n === 0) {
    return {
      min: null,
      q1: null,
      median: null,
      q3: null,
      max: null,
      whiskerMin: null,
      whiskerMax: null,
      outliers: [],
    };
  }

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

  // Find min and max within whisker bounds (non-outliers) without mutating
  let whiskerMin = sorted[0];
  for (let i = 0; i < n; i++) {
    if (sorted[i] >= lowerBound) {
      whiskerMin = sorted[i];
      break;
    }
  }

  let whiskerMax = sorted[n - 1];
  for (let i = n - 1; i >= 0; i--) {
    if (sorted[i] <= upperBound) {
      whiskerMax = sorted[i];
      break;
    }
  }

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

// --- Formatter helpers -----------------------------------------------------
// Try to convert an option into a callable formatter(value, row).
// - If opt is a function, return as-is.
// - If opt is a string and begins with "JS.", treat remainder as a JS expression
//   and return new Function('value','row', 'with (window.d3po) { return (<expr>); }').
// - If expr matches a simple formatter name like "format-as-billion(value)", map
//   to window.d3po.format['format-as-billion'](value, row).
export function maybeEvalJSFormatter(opt) {
  if (typeof opt === 'function') return opt;
  if (typeof opt !== 'string') return null;
  // Accept strings starting with 'JS.' or 'JS(' for convenience
  if (!(opt.indexOf('JS.') === 0 || opt.indexOf('JS(') === 0)) return null;

  var expr;
  if (opt.indexOf('JS.') === 0) {
    expr = opt.slice(3).trim();
  } else {
    // Extract content inside the outermost parentheses of JS(...)
    var first = opt.indexOf('(');
    var last = opt.lastIndexOf(')');
    if (first >= 0 && last > first) {
      expr = opt.substring(first + 1, last).trim();
    } else {
      expr = opt.slice(3).trim();
    }
  }

  // match simple formatter name: name(args...)
  var m = expr.match(/^([A-Za-z0-9_\-]+)\s*\((.*)\)$/);
  if (m) {
    var name = m[1];
    var args = m[2] || '';
    try {
      return new Function(
        'value',
        'row',
        'return window.d3po.format["' + name + '"](' + args + ');'
      );
    } catch (e) {
      console.warn('d3po: failed compiling simple formatter', opt, e);
      return null;
    }
  }

  // Fallback: evaluate expression with window.d3po available in scope
  try {
    return new Function(
      'value',
      'row',
      'with (window.d3po) { return (' + expr + '); }'
    );
  } catch (e) {
    console.warn('d3po: failed compiling JS formatter expression:', opt, e);
    return null;
  }
}

// Built-in formatters namespace. Users can call via JS.formatAsBillion(value)
// or using the dashed names via JS.format-as-billion(value) which maps to
// window.d3po.format['format-as-billion'].
window.d3po = window.d3po || {};
window.d3po.format = window.d3po.format || {};

window.d3po.format['format-as-billion'] = function (value, decimals) {
  if (value == null || isNaN(value)) return '';
  decimals = typeof decimals === 'number' ? decimals : 2;
  return (value / 1e9).toFixed(decimals) + 'B';
};

window.d3po.format['format-as-percentage'] = function (value, decimals) {
  if (value == null || isNaN(value)) return '';
  decimals = typeof decimals === 'number' ? decimals : 0;
  return (value * 100).toFixed(decimals) + '%';
};

// Also provide camelCase helpers for convenience
window.d3po.format.formatAsBillion = window.d3po.format['format-as-billion'];
window.d3po.format.formatAsPercentage =
  window.d3po.format['format-as-percentage'];
