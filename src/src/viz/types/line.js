(() => {
  let fetchValue;
  let graph;
  let line;
  let nest;
  let sort;
  let stack;

  fetchValue = require('../../core/fetch/value.js');

  graph = require('./helpers/graph/draw.js');

  nest = require('./helpers/graph/nest.js');

  sort = require('../../array/sort.js');

  stack = require('./helpers/graph/stack.js');

  line = vars => {
    let d;
    let data;
    let domains;
    let i;
    let j;
    let len;
    let len1;
    let point;
    let ref;
    let xval;
    let yval;
    graph(vars, {
      buffer: vars.axes.opposite,
      mouse: true
    });
    domains = vars.x.domain.viz.concat(vars.y.domain.viz);
    if (domains.indexOf(void 0) >= 0) {
      return [];
    }
    data = sort(vars.data.viz, null, null, null, vars);
    for (i = 0, len = data.length; i < len; i++) {
      point = data[i];
      ref = point.values;
      for (j = 0, len1 = ref.length; j < len1; j++) {
        d = ref[j];
        xval = fetchValue(vars, d, vars.x.value);
        if (xval !== null) {
          d.d3po.x2 = false;
          d.d3po.x = vars.x.scale.viz(xval);
        } else {
          d.d3po.x2 = true;
          d.d3po.x = vars.x2.scale.viz(fetchValue(vars, d, vars.x2.value));
        }
        d.d3po.x += vars.axes.margin.viz.left;
        yval = fetchValue(vars, d, vars.y.value);
        if (yval !== null) {
          d.d3po.y2 = false;
          d.d3po.y = vars.y.scale.viz(yval);
        } else {
          d.d3po.y2 = true;
          d.d3po.y = vars.y2.scale.viz(fetchValue(vars, d, vars.y2.value));
        }
        d.d3po.y += vars.axes.margin.viz.top;
      }
    }
    if (vars.axes.stacked) {
      return stack(vars, data);
    } else {
      return data;
    }
  };

  line.filter = (vars, data) => nest(vars, data);

  line.requirements = ['data', 'x', 'y'];

  line.setup = vars => {
    let axis;
    if (!vars.axes.discrete) {
      axis = vars.time.value === vars.y.value ? 'y' : 'x';
      vars.self[axis]({
        scale: 'discrete'
      });
    }
  };

  line.shapes = ['line'];

  line.tooltip = 'static';

  module.exports = line;
}).call(this);
