// Groups data into groups to use with D3 layouts. Helps prevent key name
// mismatches (parent, child, value, etc).
(() => {
  var fetchValue;

  fetchValue = require('../fetch/value.js');

  module.exports = (vars, data, nesting) => {
    var d, groupedData, i, j, k, len, len1, n, strippedData, val;
    groupedData = d3.nest();
    if (vars.id.grouping.value) {
      if (nesting === void 0) {
        nesting = vars.id.nesting;
      }
      for (i = j = 0, len = nesting.length; j < len; i = ++j) {
        n = nesting[i];
        if (i < vars.depth.value) {
          (n => groupedData.key(d => fetchValue(vars, d.d3po, n)))(n);
        }
      }
    }
    strippedData = [];
    for (k = 0, len1 = data.length; k < len1; k++) {
      d = data[k];
      val = vars.size.value ? fetchValue(vars, d, vars.size.value) : 1;
      if (val && typeof val === 'number' && val > 0) {
        delete d.d3po.r;
        delete d.d3po.x;
        delete d.d3po.y;
        strippedData.push({
          d3po: d,
          id: d[vars.id.value],
          value: val
        });
      }
    }
    return groupedData.entries(strippedData);
  };
}).call(this);
