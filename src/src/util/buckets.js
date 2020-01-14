// Expands a min/max into a specified number of buckets
(() => {
  module.exports = (arr, n) => {
    const step = (1 / (n - 1)) * (arr[1] - arr[0]);
    return d3.range(arr[0], arr[1] + step, step);
  };
}).call(this);
