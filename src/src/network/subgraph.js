// Returns a subgraph of distance K away from the source node
(function() {
  var normalize;

  normalize = require('./normalize.js');

  module.exports = function(edges, source, options) {
    var K,
      dfs,
      directed,
      distance,
      edge,
      endpoint,
      id,
      nodeid,
      nodes,
      ref,
      startpoint,
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
      (directed = options.directed),
      (distance = options.distance),
      (nodeid = options.nodeid),
      (startpoint = options.startpoint),
      (endpoint = options.endpoint),
      (K = options.K),
      (nodes = options.nodes);
    visited = {};
    visited[source] = true;
    dfs = function(origin, curr_distance) {
      var a, b, edge, i, len, new_distance, ref1, ref2, results;
      ref1 = nodes[origin].outedges;
      results = [];
      for (i = 0, len = ref1.length; i < len; i++) {
        edge = ref1[i];
        a = nodeid(startpoint(edge));
        b = nodeid(endpoint(edge));
        if (!directed && b === origin) {
          (ref2 = [b, a]), (a = ref2[0]), (b = ref2[1]);
        }
        if (!(b in visited)) {
          new_distance = curr_distance + distance(edge);
          if (new_distance <= K) {
            visited[b] = true;
            results.push(dfs(b, new_distance));
          } else {
            results.push(void 0);
          }
        } else {
          results.push(void 0);
        }
      }
      return results;
    };
    dfs(source, 0);
    return {
      nodes: (function() {
        var results;
        results = [];
        for (id in visited) {
          results.push(nodes[id].node);
        }
        return results;
      })(),
      edges: (function() {
        var i, len, results;
        results = [];
        for (i = 0, len = edges.length; i < len; i++) {
          edge = edges[i];
          if (
            nodeid(startpoint(edge)) in visited &&
            nodeid(endpoint(edge)) in visited
          ) {
            results.push(edge);
          }
        }
        return results;
      })()
    };
  };
}.call(this));
