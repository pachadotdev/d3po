// Community detection algorithm (graph clustering/partitioning)
// Based on the paper:
// Finding community structure in very large networks, A Clauset, MEJ Newman, C Moore - Physical review E, 2004

(() => {
  let normalize;

  normalize = require('./normalize.js');

  module.exports = (edges, options) => {
    let a;
    let b;
    let cid;
    let commSize;
    let commSizes;
    let communities;
    let community;
    let deltaQ;
    let edge;
    let endpoint;
    let events;
    let i;
    let id;
    let iter;
    let j;
    let k;
    let len;
    let len1;
    let linksMap;
    let m;
    let maxa;
    let maxb;
    let node;
    let nodeid;
    let nodes;
    let nodesMap;
    let ref;
    let ref1;
    let result;
    let startpoint;
    events = [];
    if (options == null) {
      options = {};
    }
    if (options.nodes == null || typeof options.nodes !== 'object') {
      (ref = normalize(edges, options)), (edges = ref[0]), (options = ref[1]);
      if (options === null) {
        return null;
      }
    }
    nodeid = options.nodeid;
    startpoint = options.startpoint;
    endpoint = options.endpoint;
    nodes = options.nodes;
    nodesMap = {};
    for (id in nodes) {
      nodesMap[id] = {
        node: nodes[id].node,
        degree: 0
      };
    }
    m = 0;
    linksMap = {};
    for (i = 0, len = edges.length; i < len; i++) {
      edge = edges[i];
      a = nodeid(startpoint(edge));
      b = nodeid(endpoint(edge));
      if (!(a in linksMap)) {
        linksMap[a] = {};
      }
      if (!(b in linksMap)) {
        linksMap[b] = {};
      }
      if (!(b in linksMap[a])) {
        linksMap[a][b] = 0;
        linksMap[b][a] = 0;
        m++;
        nodesMap[a].degree += 1;
        nodesMap[b].degree += 1;
      }
    }
    communities = {};
    for (id in nodesMap) {
      node = nodesMap[id];
      communities[id] = {
        score: node.degree / (2.0 * m),
        nodes: [id]
      };
    }
    for (a in linksMap) {
      for (b in linksMap[a]) {
        linksMap[a][b] =
          1.0 / (2 * m) -
          (nodesMap[a].degree * nodesMap[b].degree) / (4.0 * m * m);
      }
    }
    iter = 0;
    while (iter < 1000) {
      deltaQ = -1;
      maxa = void 0;
      maxb = void 0;
      for (a in linksMap) {
        for (b in linksMap[a]) {
          if (linksMap[a][b] > deltaQ) {
            deltaQ = linksMap[a][b];
            maxa = a;
            maxb = b;
          }
        }
      }
      if (deltaQ < 0) {
        break;
      }
      for (k in linksMap[maxa]) {
        if (k !== maxb) {
          if (k in linksMap[maxb]) {
            linksMap[maxb][k] += linksMap[maxa][k];
          } else {
            linksMap[maxb][k] =
              linksMap[maxa][k] -
              2 * communities[maxb].score * communities[k].score;
          }
          linksMap[k][maxb] = linksMap[maxb][k];
        }
        delete linksMap[k][maxa];
      }
      for (k in linksMap[maxb]) {
        if (!(k in linksMap[maxa]) && k !== maxb) {
          linksMap[maxb][k] -=
            2 * communities[maxa].score * communities[k].score;
          linksMap[k][maxb] = linksMap[maxb][k];
        }
      }
      ref1 = communities[maxa].nodes;
      for (j = 0, len1 = ref1.length; j < len1; j++) {
        node = ref1[j];
        communities[maxb].nodes.push(node);
      }
      communities[maxb].score += communities[maxa].score;
      if (options.vdebug) {
        events.push({
          type: 'merge',
          father: maxb,
          child: maxa,
          nodes: communities[maxb].nodes
        });
      }
      delete communities[maxa];
      delete linksMap[maxa];
      iter++;
    }
    commSizes = (() => {
      let results;
      results = [];
      for (cid in communities) {
        community = communities[cid];
        results.push([cid, community.nodes.length]);
      }
      return results;
    })();
    commSizes.sort((a, b) => b[1] - a[1]);
    result = (() => {
      let l;
      let len2;
      let results;
      results = [];
      for (l = 0, len2 = commSizes.length; l < len2; l++) {
        commSize = commSizes[l];
        results.push(communities[commSize[0]].nodes);
      }
      return results;
    })();
    return [result, events];
  };
}).call(this);
