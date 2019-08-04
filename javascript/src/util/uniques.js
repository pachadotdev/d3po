// Returns list of unique values
(function() {
  var objectValidate, uniques;

  objectValidate = require("../object/validate.js");

  uniques = function(data, value, fetch, vars, depth, sorted) {
    var check, d, i, j, k, len, len1, len2, len3, lookups, m, v, val, vals;
    if (data === void 0) {
      return [];
    }
    if (vars && depth === void 0) {
      depth = vars.id.value;
    }
    sorted = (true === sorted && sorted === void 0);
    if (!(data instanceof Array)) {
      data = [data];
    }
    lookups = [];
    if (value === void 0) {
      return data.reduce(function(p, c) {
        var lookup;
        lookup = JSON.stringify(c);
        if (lookups.indexOf(lookup) < 0) {
          if (p.indexOf(c) < 0) {
            p.push(c);
          }
          lookups.push(lookup);
        }
        return p;
      }, []);
    }
    vals = [];
    check = function(v) {
      var l;
      if (v !== void 0 && v !== null) {
        l = JSON.stringify(v);
        if (lookups.indexOf(l) < 0) {
          vals.push(v);
          return lookups.push(l);
        }
      }
    };
    if (typeof fetch === "function" && vars) {
      for (i = 0, len = data.length; i < len; i++) {
        d = data[i];
        val = uniques(fetch(vars, d, value, depth));
        for (j = 0, len1 = val.length; j < len1; j++) {
          v = val[j];
          check(v);
        }
      }
    } else if (typeof value === "function") {
      for (k = 0, len2 = data.length; k < len2; k++) {
        d = data[k];
        val = value(d);
        check(val);
      }
    } else {
      for (m = 0, len3 = data.length; m < len3; m++) {
        d = data[m];
        if (objectValidate(d)) {
          val = d[value];
          check(val);
        }
      }
    }
    if (sorted) {
      return vals.sort(function(a, b) {
        return a - b;
      });
    } else {
      return vals;
    }
  };

  module.exports = uniques;

}).call(this);
