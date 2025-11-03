/**
 * Color utilities for d3po visualizations
 * @module colors
 */

import * as d3 from 'd3';

/**
 * Normalize color strings so d3.color can parse them.
 * Supports 8-digit hex with alpha (#RRGGBBAA) by converting to rgba(r,g,b,a).
 * Returns input unchanged when no conversion needed.
 * @param {string} s
 * @returns {string}
 */
export function normalizeColorString(s) {
  if (typeof s !== 'string') return s;
  const m = s.match(/^#([0-9a-fA-F]{8})$/);
  if (!m) return s;
  const hex = m[1];
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const a = parseInt(hex.slice(6, 8), 16) / 255;
  return `rgba(${r}, ${g}, ${b}, ${Number(a.toFixed(3))})`;
}

/**
 * Creates a color scale based on unique values
 * @param {Array} data - Array of data objects
 * @param {string} colorField - Field name for color mapping
 * @param {Function} colorScale - D3 color scale function
 * @returns {Function} Color accessor function
 */
export function createColorScale(data, colorField, colorScale) {
  // Default palette used when R-side color argument is NULL
  const DEFAULT_PALETTE = [
    '#74c0e2',
    '#406662',
    '#549e95',
    '#8abdb6',
    '#bcd8af',
    '#a8c380',
    '#ede788',
    '#d6c650',
    '#dc8e7a',
    '#d05555',
    '#bf3251',
    '#872a41',
    '#993f7b',
    '#7454a6',
    '#a17cb0',
    '#d1a1bc',
    '#a1aafb',
    '#5c57d9',
    '#1c26b3',
    '#4d6fd0',
    '#7485aa',
    '#d3d3d3',
  ];

  // Check if colorField is a named vector (object with string keys)
  // R named vectors serialize as objects like {"Africa": "#123", "Asia": "#456"}
  const isNamedVector = input => {
    if (!input || typeof input !== 'object' || Array.isArray(input))
      return false;
    // Check if it has string keys and all values are strings (colors)
    const keys = Object.keys(input);
    return keys.length > 0 && keys.every(k => typeof input[k] === 'string');
  };

  // If colorField is a named vector, create a lookup function
  if (isNamedVector(colorField)) {
    const colorMap = colorField; // It's already the {name: color} object

    // Helper to extract group value from a row
    const getGroupValue = row => {
      if (!row || typeof row !== 'object') return String(row);
      if (row.group !== undefined) return String(row.group);
      // Try common group field names
      for (const field of [
        'reporter_continent',
        'partner_continent',
        'continent',
        'type',
        'category',
      ]) {
        if (row[field] !== undefined) return String(row[field]);
      }
      // Use first string/number property
      for (const k of Object.keys(row)) {
        if (typeof row[k] === 'string' || typeof row[k] === 'number')
          return String(row[k]);
      }
      return '';
    };

    return d => {
      const groupVal = getGroupValue(d);
      // Look up the group value in the named vector
      if (colorMap[groupVal]) {
        return normalizeColorString(colorMap[groupVal]);
      }
      // Fallback to first color if not found
      return normalizeColorString(Object.values(colorMap)[0]);
    };
  }

  // Coerce palette-like objects (R may serialize named vectors as objects)
  const coercePalette = input => {
    if (!input) return null;
    if (Array.isArray(input)) return input.length ? input : null;
    if (typeof input === 'object') {
      const vals = Object.values(input);
      return vals.length ? vals : null;
    }
    return null;
  };

  const providedPalette = coercePalette(colorField);

  // If the caller provided an explicit palette (array of color strings)
  if (providedPalette) {
    const palette = providedPalette.length ? providedPalette : DEFAULT_PALETTE;

    // Build deterministic mapping from row identity to a palette color.
    // We prefer common fields like 'group' or a single string/number column if present.
    const keyForRow = row => {
      if (!row || typeof row !== 'object') return String(row);
      if (row.group !== undefined) return String(row.group);
      // prefer first string/number property
      for (const k of Object.keys(row)) {
        if (typeof row[k] === 'string' || typeof row[k] === 'number')
          return String(row[k]);
      }
      // fallback to JSON
      try {
        return JSON.stringify(row);
      } catch (e) {
        return String(row);
      }
    };

    const mapping = {};
    let idx = 0;
    data.forEach(r => {
      const k = keyForRow(r);
      if (!(k in mapping)) {
        mapping[k] = normalizeColorString(palette[idx % palette.length]);
        idx += 1;
      }
    });

    return d => {
      const k = keyForRow(d);
      return mapping[k] || palette[0];
    };
  }

  // When colorField is null/undefined explicitly, use the DEFAULT_PALETTE
  if (!colorField) {
    const palette = DEFAULT_PALETTE;
    const keyForRow = row => {
      if (!row || typeof row !== 'object') return String(row);
      if (row.group !== undefined) return String(row.group);
      for (const k of Object.keys(row)) {
        if (typeof row[k] === 'string' || typeof row[k] === 'number')
          return String(row[k]);
      }
      try {
        return JSON.stringify(row);
      } catch (e) {
        return String(row);
      }
    };
    const mapping = {};
    let idx = 0;
    data.forEach(r => {
      const k = keyForRow(r);
      if (!(k in mapping)) {
        mapping[k] = normalizeColorString(palette[idx % palette.length]);
        idx += 1;
      }
    });

    return d => {
      const k = keyForRow(d);
      return mapping[k] || palette[0];
    };
  }

  // colorField is assumed to be a string: map unique values of that field to colors
  const uniqueValues = [...new Set(data.map(d => d[colorField]))];
  const colors = {};

  uniqueValues.forEach((value, i) => {
    colors[value] =
      (data.find(d => d[colorField] === value) || {}).color ||
      colorScale(i / uniqueValues.length);
  });

  return d => colors[d[colorField]] || colorScale(0);
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
 * Creates a highlight color for interactive elements
 * @param {string} baseColor - Base color string
 * @returns {string} Highlighted color
 */
export function getHighlightColor(baseColor) {
  let color = null;
  try {
    color = d3.color(baseColor);
  } catch (e) {
    color = null;
  }
  if (!color) {
    // fallback to a neutral grey if input color is invalid
    color = d3.color('#999');
  }
  // For light colors, darken instead of brighten
  const luminance =
    0.2126 * (color.r || 0) + 0.7152 * (color.g || 0) + 0.0722 * (color.b || 0);
  try {
    return luminance > 180
      ? color.darker(0.3).toString()
      : color.brighter(0.5).toString();
  } catch (e) {
    return color.toString();
  }
}

/**
 * Return a tinted version of a color blended with white.
 * factor: 0 -> original color, 1 -> white. Typical small values like 0.1..0.3
 * produce a subtle whitening/tint effect without changing the original stroke color.
 * @param {string} baseColor - color parsable by d3.color
 * @param {number} factor - blend factor in [0,1]
 * @returns {string} CSS rgb(...) string
 */
export function tintColor(baseColor, factor = 0.15) {
  try {
    const c = d3.color(baseColor);
    if (!c) return baseColor;
    // ensure RGB
    const r = c.r;
    const g = c.g;
    const b = c.b;
    const f = Math.max(0, Math.min(1, Number(factor) || 0));
    const nr = Math.round(r + (255 - r) * f);
    const ng = Math.round(g + (255 - g) * f);
    const nb = Math.round(b + (255 - b) * f);
    return `rgb(${nr}, ${ng}, ${nb})`;
  } catch (e) {
    return baseColor;
  }
}
