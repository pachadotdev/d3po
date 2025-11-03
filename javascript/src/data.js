/**
 * Data processing and validation utilities for d3po visualizations
 * @module data
 */

import * as d3 from 'd3';

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
