// Finds the shortest paths in the graph
(function() {
  var Heap, normalize;

  Heap = require('heap');

  normalize = require('./normalize.js');

  module.exports = function(edges, source, options) {
    var K,
      a,
      alt,
      b,
      directed,
      distance,
      edge,
      endpoint,
      getPath,
      heap,
      i,
      id,
      j,
      len,
      len1,
      maxsize,
      node,
      nodeid,
      nodes,
      path,
      ref,
      ref1,
      ref2,
      res,
      result,
      startpoint,
      target,
      u,
      visited;
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
    heap = new Heap(function(a, b) {
      return a.distance - b.distance;
    });
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
    getPath = function(path) {
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
}.call(this));
