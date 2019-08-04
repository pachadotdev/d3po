// Normalizes the graph input and checks if it is valid
(function() {
  var print;

  print = require("../core/console/print.js");

  module.exports = function(edges, options) {
    var K, a, b, directed, distance, edge, edge2distance, endpoint, errormsg, i, id, id1, idA, idB, j, k, l, len, len1, len2, node, nodeA, nodeB, nodeid, nodes, ref, ref1, source, startpoint, target, vdebug;
    source = options.source, target = options.target, directed = options.directed, distance = options.distance, nodeid = options.nodeid, startpoint = options.startpoint, endpoint = options.endpoint, K = options.K, vdebug = options.vdebug;
    if (!directed) {
      directed = false;
    }
    if (K == null) {
      K = 1;
    }
    if (nodeid == null) {
      nodeid = function(node) {
        return node;
      };
    } else if (typeof nodeid === 'string') {
      nodeid = (function(nodeid) {
        return function(node) {
          return node[nodeid];
        };
      })(nodeid);
    }
    if ((source != null) && typeof source === 'object') {
      source = nodeid(source);
    }
    if ((target != null) && typeof target === 'object') {
      target = nodeid(target);
    }
    if (startpoint == null) {
      startpoint = function(edge) {
        return edge.source;
      };
    } else if (typeof startpoint === 'string') {
      startpoint = (function(startpoint) {
        return function(edge) {
          return edge[startpoint];
        };
      })(startpoint);
    }
    if (endpoint == null) {
      endpoint = function(edge) {
        return edge.target;
      };
    } else if (typeof endpoint === 'string') {
      endpoint = (function(endpoint) {
        return function(edge) {
          return edge[endpoint];
        };
      })(endpoint);
    }
    if (distance == null) {
      distance = function(edge) {
        return 1;
      };
    } else if (typeof distance === 'number') {
      distance = (function(distance) {
        return function(edge) {
          return distance;
        };
      })(distance);
    } else if (typeof distance === 'string') {
      distance = (function(distance) {
        return function(edge) {
          return edge[distance];
        };
      })(distance);
    } else if (distance instanceof Array) {
      edge2distance = {};
      for (i = j = 0, len = edges.length; j < len; i = ++j) {
        edge = edges[i];
        a = nodeid(startpoint(edge));
        b = nodeid(endpoint(edge));
        edge2distance[a + '_' + b] = distance[i];
      }
      distance = function(edge) {
        a = nodeid(startpoint(edge));
        b = nodeid(endpoint(edge));
        return edge2distance[a + '_' + b];
      };
    }
    nodes = {};
    for (k = 0, len1 = edges.length; k < len1; k++) {
      edge = edges[k];
      nodeA = startpoint(edge);
      nodeB = endpoint(edge);
      idA = nodeid(nodeA);
      idB = nodeid(nodeB);
      ref = [nodeA, nodeB];
      for (l = 0, len2 = ref.length; l < len2; l++) {
        node = ref[l];
        id = nodeid(node);
        if (!(id in nodes)) {
          nodes[id] = {
            node: node,
            outedges: []
          };
        }
      }
      nodes[idA].outedges.push(edge);
      if (!directed) {
        nodes[idB].outedges.push(edge);
      }
    }
    errormsg = null;
    if (edges.length === 0) {
      errormsg = 'The length of edges is 0';
    } else if (K < 0) {
      errormsg = 'K can not have negative value';
    } else if (distance(edges[0]) == null) {
      errormsg = 'Check the distance function/attribute';
    } else if (startpoint(edges[0]) == null) {
      errormsg = 'Check the startpoint function/attribute';
    } else if (endpoint(edges[0]) == null) {
      errormsg = 'Check the endpoint function/attribute';
    } else {
      id1 = nodeid(startpoint(edges[0]));
      if ((id1 == null) || ((ref1 = typeof id1) !== 'string' && ref1 !== 'number')) {
        errormsg = 'Check the nodeid function/attribute';
      } else if ((source != null) && !(source in nodes)) {
        errormsg = 'The source is not in the graph';
      } else if ((target != null) && !(target in nodes)) {
        errormsg = 'The target is not in the graph';
      }
    }
    if (errormsg != null) {
      print.error(errormsg);
      return null;
    }
    return [
      edges, {
        source: source,
        target: target,
        directed: directed,
        distance: distance,
        nodeid: nodeid,
        startpoint: startpoint,
        endpoint: endpoint,
        K: K,
        nodes: nodes,
        vdebug: vdebug
      }
    ];
  };

}).call(this);
