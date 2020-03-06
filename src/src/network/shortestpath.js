// Finds the shortest paths in the graph
(() => {
  let Heap;
  let normalize;

  Heap = require('heap');

  normalize = require('./normalize.js');

  module.exports = (edges, source, options) => {
    let K;
    let a;
    let alt;
    let b;
    let directed;
    let distance;
    let edge;
    let endpoint;
    let getPath;
    let heap;
    let i;
    let id;
    let j;
    let len;
    let len1;
    let maxsize;
    let node;
    let nodeid;
    let nodes;
    let path;
    let ref;
    let ref1;
    let ref2;
    let res;
    let result;
    let startpoint;
    let target;
    let u;
    let visited;
    if (options == null) {
      options = {};
    }
    options.source = source;
    if (options.nodes == null || typeof options.nodes !== 'object') {
      (ref = normalize(edges, options)), (edges = ref[0]), (options = ref[1]);
      if (options === null) {
        return null;
      }
    }
    (source = options.source),
      (target = options.target),
      (directed = options.directed),
      (distance = options.distance),
      (nodeid = options.nodeid),
      (startpoint = options.startpoint),
      (endpoint = options.endpoint),
      (K = options.K),
      (nodes = options.nodes);
    for (id in nodes) {
      node = nodes[id];
      node.count = 0;
    }
    heap = new Heap((a, b) => a.distance - b.distance);
    visited = {};
    if (target == null) {
      visited[source] = true;
    }
    heap.push({
      edge: null,
      target: source,
      distance: 0
    });
    maxsize = 0;
    result = [];
    while (!heap.empty()) {
      maxsize = Math.max(maxsize, heap.size());
      path = heap.pop();
      u = path.target;
      nodes[u].count++;
      if (target == null) {
        result.push(path);
      } else if (u === target) {
        result.push(path);
      }
      if (result.length === K) {
        break;
      }
      if (nodes[u].count <= K) {
        ref1 = nodes[u].outedges;
        for (i = 0, len = ref1.length; i < len; i++) {
          edge = ref1[i];
          a = nodeid(startpoint(edge));
          b = nodeid(endpoint(edge));
          if (!directed && b === u) {
            (ref2 = [b, a]), (a = ref2[0]), (b = ref2[1]);
          }
          if (target == null) {
            if (visited[b]) {
              continue;
            }
            visited[b] = true;
          }
          alt = path.distance + distance(edge);
          heap.push({
            edge: edge,
            previous: path,
            target: b,
            distance: alt
          });
        }
      }
    }
    getPath = path => {
      edges = [];
      while (path.edge != null) {
        edges.push(path.edge);
        path = path.previous;
      }
      return edges.reverse();
    };
    for (j = 0, len1 = result.length; j < len1; j++) {
      res = result[j];
      if (target != null) {
        delete res.target;
        res.edges = getPath(res);
      }
      delete res.edge;
      delete res.previous;
    }
    return result;
  };
}).call(this);
