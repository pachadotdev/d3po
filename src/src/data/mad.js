// Finds outliers in 1-dim data by computing the median absolute deviation for each point
(() => {
  module.exports = points => {
    var mad, median, result;
    median = d3.median(points);
    mad = d3.median(points.map(p => Math.abs(p - median)));
    result = points.map((p, i) => [i, Math.abs(p - median) / mad]);
    return result.sort((a, b) => b[1] - a[1]);
  };
}).call(this);
