// Sorts an array of objects
(function() {
  var comparator, fetchSort;

  comparator = require('./comparator.js');

  fetchSort = require('../core/fetch/sort.js');

  module.exports = function(arr, keys, sort, colors, vars, depth) {
    var d, data, i, len;
    if (!arr || arr.length <= 1) {
      return arr || [];
    } else {
      if (vars) {
        if (!keys) {
          keys = vars.order.value || vars.size.value || vars.id.value;
        }
        if (!sort) {
          sort = vars.order.sort.value;
        }
        if (!colors) {
          colors = vars.color.value || [];
        }
        for (i = 0, len = arr.length; i < len; i++) {
          d = arr[i];
          if (!d.d3po) {
            d.d3po = {};
          }
          data = 'd3po' in d && 'd3po' in d.d3po ? d.d3po : d;
          d.d3po.sortKeys = fetchSort(vars, data, keys, colors, depth);
        }
      }
      return arr.sort(function(a, b) {
        return comparator(a, b, keys, sort, colors, vars, depth);
      });
    }
  };
}.call(this));
