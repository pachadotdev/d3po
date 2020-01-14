// Get Key Types from Data
(() => {
  let print;
  let validObject;

  const indexOf =
    [].indexOf ||
    function(item) {
      for (let i = 0, l = this.length; i < l; i++) {
        if (i in this && this[i] === item) {
          return i;
        }
      }
      return -1;
    };

  print = require('../console/print.js');

  validObject = require('../../object/validate.js');

  module.exports = (vars, type) => {
    let get_keys;
    let k;
    let kk;
    let lengthMatch;
    let ref;
    let ref1;
    let timerString;
    let v;
    let vv;
    timerString = type + ' key analysis';
    if (vars.dev.value) {
      print.time(timerString);
    }
    vars[type].keys = {};
    get_keys = arr => {
      let a;
      let i;
      let k;
      let len;
      let results;
      let results1;
      let v;
      if (arr instanceof Array) {
        results = [];
        for (i = 0, len = arr.length; i < len; i++) {
          a = arr[i];
          results.push(get_keys(a));
        }
        return results;
      } else if (validObject(arr)) {
        results1 = [];
        for (k in arr) {
          v = arr[k];
          if (
            k.indexOf('d3po') !== 0 &&
            !(indexOf.call(vars[type].keys, k) >= 0) &&
            v !== null
          ) {
            results1.push((vars[type].keys[k] = typeof v));
          } else {
            results1.push(void 0);
          }
        }
        return results1;
      }
    };
    if (validObject(vars[type].value)) {
      lengthMatch = d3.keys(vars[type].value).length === vars.id.nesting.length;
      ref = vars[type].value;
      for (k in ref) {
        v = ref[k];
        if (lengthMatch && vars.id.nesting.indexOf(k) >= 0 && validObject(v)) {
          for (kk in v) {
            vv = v[kk];
            get_keys(vv);
          }
        } else {
          get_keys(v);
        }
      }
    } else {
      ref1 = vars[type].value;
      for (k in ref1) {
        v = ref1[k];
        get_keys(v);
      }
    }
    if (vars.dev.value) {
      return print.time(timerString);
    }
  };
}).call(this);
