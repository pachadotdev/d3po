/**
 * Tooltip utilities for d3po visualizations
 * @module tooltip
 */

import * as d3 from 'd3';
import { getTextColor } from './colors.js';

// Inject tooltip CSS styles once
let tooltipStylesInjected = false;
let currentTooltipFont = null;

function injectTooltipStyles(fontFamily, fontSize, explicitTooltipBg) {
  // If font/theme changed, remove old styles
  const theme = explicitTooltipBg ? `explicit-${explicitTooltipBg}` : 'auto';
  const newFont = `${fontFamily}-${fontSize}-${theme}`;
  if (tooltipStylesInjected && currentTooltipFont === newFont) return;

  // Remove old style if exists
  const oldStyle = document.getElementById('d3po-tooltip-styles');
  if (oldStyle) {
    oldStyle.remove();
  }

  // determine colors
  const bg = explicitTooltipBg || 'white';
  const border = explicitTooltipBg ? d3.color(bg).darker(1).toString() : '#999';
  const text = explicitTooltipBg
    ? getTextColor(bg) === 'white'
      ? '#eee'
      : '#111'
    : '#333';
  const arrowInner = bg;
  const arrowBorder = border;

  const style = document.createElement('style');
  style.id = 'd3po-tooltip-styles';
  style.textContent = `
    .d3po-tooltip {
      position: absolute;
      background: ${bg};
      border: 1px solid ${border};
      color: ${text};
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
      border-top: 6px solid ${arrowInner};
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
      border-top: 7px solid ${arrowBorder};
    }
    
    .d3po-tooltip strong {
      display: block;
      margin-bottom: 4px;
      color: ${text};
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
  // detect explicit tooltip bg from nearest d3po container
  let explicitTooltipBg = null;
  try {
    const target =
      event && event.target
        ? event.target
        : document.elementFromPoint(event.clientX, event.clientY);
    const ttEl =
      target && target.closest ? target.closest('[data-d3po-tooltips]') : null;
    if (ttEl) explicitTooltipBg = ttEl.getAttribute('data-d3po-tooltips');
  } catch (e) {
    explicitTooltipBg = null;
  }

  injectTooltipStyles(fontFamily, fontSize, explicitTooltipBg);

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
  if (typeof optionsTooltip === 'string') {
    // Import maybeEvalJSFormatter dynamically to avoid circular deps
    const { maybeEvalJSFormatter } = require('./formatters.js');
    return maybeEvalJSFormatter(optionsTooltip);
  }
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
