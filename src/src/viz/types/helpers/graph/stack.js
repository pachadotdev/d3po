(function() {
  var fetchValue;

  fetchValue = require('../../../../core/fetch/value.js');

  module.exports = function(vars, data) {
    var d,
      flip,
      i,
      j,
      len,
      len1,
      margin,
      neg,
      negativeData,
      offset,
      opposite,
      positiveData,
      scale,
      stack,
      stacked,
      v,
      val;
    stacked = vars.axes.stacked || vars.axes.opposite;
    flip = vars[stacked].scale.viz(0);
    scale = vars[stacked].scale.value;
    opposite = stacked === 'x' ? 'y' : 'x';
    margin =
      stacked === 'y' ? vars.axes.margin.viz.top : vars.axes.margin.viz.left;
    offset = scale === 'share' ? 'expand' : 'zero';
    stack = d3.layout
      .stack()
      .values(function(d) {
        return d.values || [d];
      })
      .offset(offset)
      .x(function(d) {
        return d.d3po[opposite];
      })
      .y(function(d) {
        return (
          flip -
          vars[stacked].scale.viz(fetchValue(vars, d, vars[stacked].value))
        );
      })
      .out(function(d, y0, y) {
        if (scale === 'share') {
          d.d3po[stacked + '0'] = (1 - y0) * flip;
          d.d3po[stacked] = d.d3po[stacked + '0'] - y * flip;
        } else {
          d.d3po[stacked + '0'] = flip;
          if (vars.axes.stacked) {
            d.d3po[stacked + '0'] -= y0;
          }
          d.d3po[stacked] = d.d3po[stacked + '0'] - y;
        }
        d.d3po[stacked] += margin;
        return (d.d3po[stacked + '0'] += margin);
      });
    positiveData = [];
    negativeData = [];
    for (i = 0, len = data.length; i < len; i++) {
      d = data[i];
      val = fetchValue(vars, d, vars[stacked].value);
      if (val instanceof Array) {
        neg = true;
        for (j = 0, len1 = val.length; j < len1; j++) {
          v = val[j];
          if (v >= 0) {
            neg = false;
            break;
          }
        }
        if (neg) {
          negativeData.push(d);
        } else {
          positiveData.push(d);
        }
      } else {
        if (val >= 0) {
          positiveData.push(d);
        }
        if (val < 0) {
          negativeData.push(d);
        }
      }
    }
    if (positiveData.length === 0 || negativeData.length === 0) {
      return stack(data);
    } else {
      if (positiveData.length) {
        positiveData = stack(positiveData);
      }
      if (negativeData.length) {
        negativeData = stack(negativeData);
      }
      return positiveData.concat(negativeData);
    }
  };
}.call(this));
