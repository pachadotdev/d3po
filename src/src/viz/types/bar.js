(() => {
  var bar,
    buckets,
    fetchValue,
    graph,
    nest,
    stack,
    uniques,
    indexOf =
      [].indexOf ||
      function(item) {
        for (var i = 0, l = this.length; i < l; i++) {
          if (i in this && this[i] === item) return i;
        }
        return -1;
      };

  buckets = require('../../util/buckets.js');

  fetchValue = require('../../core/fetch/value.js');

  graph = require('./helpers/graph/draw.js');

  nest = require('./helpers/graph/nest.js');

  stack = require('./helpers/graph/stack.js');

  uniques = require('../../util/uniques.js');

  bar = vars => {
    var bars,
      base,
      cMargin,
      d,
      data,
      discrete,
      discreteVal,
      divisions,
      domains,
      h,
      i,
      ids,
      j,
      k,
      l,
      len,
      len1,
      len2,
      length,
      maxBars,
      maxSize,
      mod,
      nested,
      newSize,
      oMargin,
      offset,
      oppDomain,
      oppMethod,
      oppVal,
      opposite,
      p,
      padding,
      point,
      ref,
      ref1,
      space,
      value,
      w,
      x,
      zero;
    discrete = vars.axes.discrete;
    h = discrete === 'x' ? 'height' : 'width';
    w = discrete === 'x' ? 'width' : 'height';
    opposite = vars.axes.opposite;
    cMargin = discrete === 'x' ? 'left' : 'top';
    oMargin = discrete === 'x' ? 'top' : 'left';
    graph(vars, {
      buffer: true,
      zero: opposite
    });
    domains = vars.x.domain.viz.concat(vars.y.domain.viz);
    if (domains.indexOf(void 0) >= 0) {
      return [];
    }
    nested = vars.data.viz;
    if (vars.axes.stacked) {
      for (j = 0, len = nested.length; j < len; j++) {
        point = nested[j];
        stack(vars, point.values);
      }
    }
    space = vars.axes[w] / vars[vars.axes.discrete].ticks.values.length;
    padding = vars[vars.axes.discrete].padding.value;
    if (padding < 1) {
      padding *= space;
    }
    if (padding * 2 > space) {
      padding = space * 0.1;
    }
    maxSize = space - padding * 2;
    if (!vars.axes.stacked) {
      if (vars[discrete].persist.position.value) {
        if (
          ((ref = vars[discrete].value),
          indexOf.call(vars.id.nesting, ref) >= 0)
        ) {
          divisions = d3.max(nested, b => b.values.length);
        } else {
          divisions = uniques(nested, vars.id.value, fetchValue, vars).length;
        }
        maxSize /= divisions;
        offset = space / 2 - maxSize / 2 - padding;
        x = d3.scale.ordinal();
        if (divisions === 1) {
          x.domain([0]).range([0]);
        } else {
          x.domain([0, divisions - 1]).range([-offset, offset]);
        }
      } else {
        x = d3.scale.linear();
      }
    }
    data = [];
    oppMethod = vars[opposite];
    oppDomain = oppMethod.scale.viz.domain().slice();
    if (opposite.indexOf('y') === 0) {
      oppDomain = oppDomain.reverse();
    }
    if (oppDomain[0] <= 0 && oppDomain[1] >= 0) {
      zero = 0;
    } else if (oppDomain[0] < 0) {
      zero(d3.max(oppDomain));
    } else {
      zero = d3.min(oppDomain);
    }
    if (vars[discrete].persist.position.value && !vars.axes.stacked) {
      ids = uniques(
        d3.merge(nested.map(d => d.values)),
        vars.id.value,
        fetchValue,
        vars,
        vars.id.value,
        false
      );
      x.domain(ids);
      if (ids.length === 1) {
        x.range([0]);
      } else {
        x.range(buckets(x.range(), ids.length));
      }
    }
    maxBars = d3.max(nested, b => b.values.length);
    for (k = 0, len1 = nested.length; k < len1; k++) {
      p = nested[k];
      if (vars.axes.stacked) {
        bars = 1;
        newSize = maxSize;
      } else if (vars[discrete].persist.position.value) {
        bars = divisions;
        newSize = maxSize;
      } else {
        bars = p.values.length;
        if (vars[discrete].persist.size.value) {
          newSize = maxSize / maxBars;
          offset =
            space / 2 -
            (maxBars - bars) * (newSize / 2) -
            newSize / 2 -
            padding;
        } else {
          newSize = maxSize / bars;
          offset = space / 2 - newSize / 2 - padding;
        }
        x.domain([0, bars - 1]);
        x.range([-offset, offset]);
      }
      ref1 = p.values;
      for (i = l = 0, len2 = ref1.length; l < len2; i = ++l) {
        d = ref1[i];
        oppMethod = vars[opposite];
        if (vars.axes.stacked) {
          mod = 0;
        } else if (vars[discrete].persist.position.value) {
          mod = x(fetchValue(vars, d, vars.id.value));
        } else {
          mod = x(i % bars);
        }
        if (vars.axes.stacked) {
          value = d.d3po[opposite];
          base = d.d3po[opposite + '0'];
        } else {
          oppVal = fetchValue(vars, d, oppMethod.value);
          if (oppVal === null) {
            oppMethod = vars[opposite + '2'];
            oppVal = fetchValue(vars, d, oppMethod.value);
          }
          if (oppVal === 0) {
            continue;
          }
          if (oppMethod.scale.value === 'log') {
            zero = oppVal < 0 ? -1 : 1;
          }
          value = oppMethod.scale.viz(oppVal);
          base = oppMethod.scale.viz(zero);
        }
        discreteVal = fetchValue(vars, d, vars[discrete].value);
        d.d3po[discrete] = vars[discrete].scale.viz(discreteVal);
        d.d3po[discrete] += vars.axes.margin.viz[cMargin] + mod;
        length = base - value;
        d.d3po[opposite] = base - length / 2;
        if (!vars.axes.stacked) {
          d.d3po[opposite] += vars.axes.margin.viz[oMargin];
        }
        delete d.d3po.r;
        d.d3po[w] = newSize;
        d.d3po[h] = Math.abs(length);
        d.d3po.init = {};
        d.d3po.init[opposite] = oppMethod.scale.viz(zero);
        d.d3po.init[opposite] -= d.d3po[opposite];
        d.d3po.init[opposite] += vars.axes.margin.viz[oMargin];
        d.d3po.init[w] = d.d3po[w];
        if (vars.text.value) {
          delete d.d3po.label;
        } else {
          d.d3po.label = false;
        }
        data.push(d);
      }
    }
    return data;
  };

  bar.filter = (vars, data) => nest(vars, data, vars[vars.axes.discrete].value);

  bar.requirements = ['data', 'x', 'y'];

  bar.setup = vars => {
    var axis, size, y;
    if (!vars.axes.discrete) {
      axis = vars.time.value === vars.y.value ? 'y' : 'x';
      vars.self[axis]({
        scale: 'discrete'
      });
    }
    y = vars[vars.axes.opposite];
    size = vars.size;
    if (
      (!y.value && size.value) ||
      (size.changed && size.previous === y.value)
    ) {
      return vars.self[vars.axes.opposite](size.value);
    } else if (
      (!size.value && y.value) ||
      (y.changed && y.previous === size.value)
    ) {
      return vars.self.size(y.value);
    }
  };

  bar.shapes = ['square'];

  module.exports = bar;
}).call(this);
