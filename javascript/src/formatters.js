/**
 * Data formatting utilities for d3po visualizations
 * @module formatters
 */

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
 * Truncates text to fit within width
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export function truncateText(text, maxLength = 20) {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
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
