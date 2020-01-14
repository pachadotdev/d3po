const smallestGap = require('../../network/smallestgap.js');
const fetchValue = require('../../core/fetch/value.js');
//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
// Network
//------------------------------------------------------------------------------
const network = vars => {
  //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // Use filtered lists if they are available
  //----------------------------------------------------------------------------
  const nodes = vars.nodes.restricted || vars.nodes.value;

  const edges = vars.edges.restricted || vars.edges.value || [];
  const x_range = d3.extent(nodes, n => n.x);
  const y_range = d3.extent(nodes, n => n.y);

  let val_range = [1, 1];
  if (typeof vars.size.value === 'number') {
    val_range = [vars.size.value, vars.size.value];
  } else if (vars.size.value) {
    val_range = d3.extent(nodes, d => {
      const val = fetchValue(vars, d, vars.size.value);
      return val === 0 ? null : val;
    });
  }
  if (typeof val_range[0] == 'undefined') {
    val_range = [1, 1];
  }

  let max_size;
  let min_size;
  if (typeof vars.size.value === 'number') {
    max_size = vars.size.value;
    min_size = vars.size.value;
  } else {
    max_size = smallestGap(nodes, {
      accessor: function(n) {
        return [n.x, n.y];
      }
    });

    const limit = max_size / 2;

    const overlap = vars.size.value ? vars.nodes.overlap : 0.4;
    max_size = max_size * overlap;

    if (vars.edges.arrows.value) {
      max_size = max_size * 0.5;
    }

    if (val_range[0] === val_range[1]) {
      min_size = limit;
      max_size = limit;
    } else {
      const width = x_range[1] + max_size * 1.1 - (x_range[0] - max_size * 1.1);
      const height =
        y_range[1] + max_size * 1.1 - (y_range[0] - max_size * 1.1);
      const aspect = width / height;
      const app = vars.width.viz / vars.height.viz;

      let scale;
      if (app > aspect) {
        scale = vars.height.viz / height;
      } else {
        scale = vars.width.viz / width;
      }
      min_size = max_size * 0.25;
      if (min_size * scale < 2) {
        min_size = 2 / scale;
      }
    }
  }

  // Create size scale
  const radius = vars.size.scale.value
    .domain(val_range)
    .range([min_size, max_size]);

  vars.zoom.bounds = [
    [x_range[0] - max_size * 1.1, y_range[0] - max_size * 1.1],
    [x_range[1] + max_size * 1.1, y_range[1] + max_size * 1.1]
  ];

  //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // Match nodes to data
  //----------------------------------------------------------------------------
  const data = [];

  const lookup = {};
  nodes.forEach(n => {
    const d = vars.data.viz.filter(
      a => a[vars.id.value] == n[vars.id.value]
    )[0];

    const obj = d || {};

    obj[vars.id.value] = n[vars.id.value];

    obj.d3po = {};
    obj.d3po.x = n.x;
    obj.d3po.y = n.y;
    const val = fetchValue(vars, obj, vars.size.value);
    obj.d3po.r = val ? radius(val) : radius.range()[0];
    lookup[obj[vars.id.value]] = {
      x: obj.d3po.x,
      y: obj.d3po.y,
      r: obj.d3po.r
    };

    data.push(obj);
  });

  data.sort((a, b) => b.d3po.r - a.d3po.r);

  edges.forEach(l => {
    if (l.d3po) {
      delete l.d3po.spline;
    }

    l[vars.edges.source].d3po = {};
    const source = lookup[l[vars.edges.source][vars.id.value]];
    if (source !== undefined) {
      l[vars.edges.source].d3po.r = source.r;
      l[vars.edges.source].d3po.x = source.x;
      l[vars.edges.source].d3po.y = source.y;
    } else {
      delete l[vars.edges.source].d3po;
    }

    l[vars.edges.target].d3po = {};
    const target = lookup[l[vars.edges.target][vars.id.value]];
    if (target !== undefined) {
      l[vars.edges.target].d3po.r = target.r;
      l[vars.edges.target].d3po.x = target.x;
      l[vars.edges.target].d3po.y = target.y;
    } else {
      delete l[vars.edges.target].d3po;
    }
  });

  return {
    nodes: data,
    edges: edges
  };
};

//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
// Visualization Settings and Helper Functions
//------------------------------------------------------------------------------
network.nesting = false;
network.requirements = ['nodes'];
network.scale = 1.05;
network.shapes = ['circle'];
network.tooltip = 'static';
network.zoom = true;

module.exports = network;
