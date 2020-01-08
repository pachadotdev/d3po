(function() {
  var fetchValue, stringStrip, uniqueValues;

  fetchValue = require('../../../../core/fetch/value.js');

  stringStrip = require('../../../../string/strip.js');

  uniqueValues = require('../../../../util/uniques.js');

  module.exports = function(vars, data, keys) {
    var discrete, extras, key, opposite, serialized, ticks, timeAxis;
    if (keys === void 0) {
      keys = vars.id.nesting.slice(0, vars.depth.value + 1);
    } else if (keys.constructor !== Array) {
      keys = [keys];
    }
    if (extras === void 0) {
      extras = [];
    }
    if (!data) {
      data = vars.data.viz;
    }
    discrete = vars[vars.axes.discrete];
    opposite = vars[vars.axes.opposite];
    timeAxis = discrete.value === vars.time.value;
    if (timeAxis) {
      ticks = vars.data.time.ticks;
      key = vars.time.solo.value.length ? 'solo' : 'mute';
      if (vars.time[key].value.length) {
        serialized = vars.time[key].value.slice().map(function(f) {
          if (f.constructor !== Date) {
            f = f + '';
            if (f.length === 4 && parseInt(f) + '' === f) {
              f += '/01/01';
            }
            f = new Date(f);
          }
          return +f;
        });
        ticks = ticks.filter(function(f) {
          if (key === 'solo') {
            return serialized.indexOf(+f) >= 0;
          } else {
            return serialized.indexOf(+f) < 0;
          }
        });
      }
    } else if (discrete.ticks.values) {
      ticks = discrete.ticks.values;
    } else {
      ticks = uniqueValues(data, discrete.value, fetchValue, vars);
    }
    return d3
      .nest()
      .key(function(d) {
        var id, j, len, return_id, val;
        return_id = 'nesting';
        for (j = 0, len = keys.length; j < len; j++) {
          id = keys[j];
          val = fetchValue(vars, d, id);
          if (val instanceof Array) {
            val = val.join('_');
          }
          return_id += '_' + stringStrip(val);
        }
        return return_id;
      })
      .rollup(function(leaves) {
        var availables,
          filler,
          i,
          j,
          k,
          len,
          len1,
          obj,
          ref,
          tester,
          tick,
          timeVar;
        availables = uniqueValues(leaves, discrete.value, fetchValue, vars);
        timeVar = availables.length && availables[0].constructor === Date;
        if (timeVar) {
          availables = availables.map(Number);
        }
        if (discrete.zerofill.value) {
          if (discrete.scale.value === 'log') {
            if (
              opposite.scale.viz.domain().every(function(d) {
                return d < 0;
              })
            ) {
              filler = -1;
            } else {
              filler = 1;
            }
          } else {
            filler = 0;
          }
          for (i = j = 0, len = ticks.length; j < len; i = ++j) {
            tick = ticks[i];
            tester = timeAxis ? +tick : tick;
            if (availables.indexOf(tester) < 0) {
              obj = {
                d3po: {}
              };
              ref = vars.id.nesting;
              for (k = 0, len1 = ref.length; k < len1; k++) {
                key = ref[k];
                if (key in leaves[0]) {
                  obj[key] = leaves[0][key];
                }
              }
              obj[discrete.value] = tick;
              obj[opposite.value] = 0;
              obj[opposite.value] = filler;
              leaves.splice(i, 0, obj);
            }
          }
        }
        if (typeof leaves[0][discrete.value] === 'string') {
          return leaves;
        } else {
          return leaves.sort(function(a, b) {
            var ad, ao, bd, bo, xsort;
            ad = fetchValue(vars, a, discrete.value);
            bd = fetchValue(vars, b, discrete.value);
            xsort = ad - bd;
            if (xsort) {
              return xsort;
            }
            ao = fetchValue(vars, a, opposite.value);
            bo = fetchValue(vars, b, opposite.value);
            return ao - bo;
          });
        }
      })
      .entries(data);
  };
}.call(this));
