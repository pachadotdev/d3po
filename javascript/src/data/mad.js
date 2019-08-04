// Finds outliers in 1-dim data by computing the median absolute deviation for each point
(function() {
  module.exports = function(points) {
    var mad, median, result;
    median = d3.median(points);
    mad = d3.median(points.map(function(p) {
      return Math.abs(p - median);
    }));
    result = points.map(function(p, i) {
      return [i, Math.abs(p - median) / mad];
    });
    return result.sort(function(a, b) {
      return b[1] - a[1];
    });
  };

}).call(this);
