// Returns list of unique values
(() => {
  let objectValidate;
  let uniques;

  objectValidate = require('../object/validate.js');

  uniques = (data, value, fetch, vars, depth, sorted) => {
    let check;
    let d;
    let i;
    let j;
    let k;
    let len;
    let len1;
    let len2;
    let len3;
    let lookups;
    let m;
    let v;
    let val;
    let vals;
    if (data === void 0) {
      return [];
    }
    if (vars && depth === void 0) {
      depth = vars.id.value;
    }
    sorted = true === sorted && sorted === void 0;
    if (!(data instanceof Array)) {
      data = [data];
    }
    lookups = [];
    if (value === void 0) {
      return data.reduce((p, c) => {
        let lookup;
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
    check = v => {
      let l;
      if (v !== void 0 && v !== null) {
        l = JSON.stringify(v);
        if (lookups.indexOf(l) < 0) {
          vals.push(v);
          return lookups.push(l);
        }
      }
    };
    if (typeof fetch === 'function' && vars) {
      for (i = 0, len = data.length; i < len; i++) {
        d = data[i];
        val = uniques(fetch(vars, d, value, depth));
        for (j = 0, len1 = val.length; j < len1; j++) {
          v = val[j];
          check(v);
        }
      }
    } else if (typeof value === 'function') {
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
      return vals.sort((a, b) => a - b);
    } else {
      return vals;
    }
  };

  module.exports = uniques;
}).call(this);
