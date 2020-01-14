// Finds outliers in n-dim data using the Local Outlier Factor algorithm
(() => {
  let kdtree;

  kdtree = require('static-kdtree');

  module.exports = (points, K) => {
    let avg_lrd;
    let i;
    let j;
    let kdists;
    let ldr;
    let ldrs;
    let neighbors;
    let p;
    let reachDist;
    let result;
    let sqDist;
    let tree;
    if (K == null) {
      K = 10;
    }
    tree = kdtree(points);
    neighbors = (() => {
      let k;
      let len;
      let results;
      results = [];
      for (k = 0, len = points.length; k < len; k++) {
        p = points[k];
        results.push(tree.knn(p, K + 1).slice(1));
      }
      return results;
    })();
    sqDist = (i, j) => {
      let A;
      let B;
      let delta;
      let dist;
      let k;
      let ref;
      A = points[i];
      B = points[j];
      dist = 0;
      for (
        i = k = 0, ref = A.length;
        0 <= ref ? k < ref : k > ref;
        i = 0 <= ref ? ++k : --k
      ) {
        delta = A[i] - B[i];
        dist += delta * delta;
      }
      return dist;
    };
    kdists = (() => {
      let k;
      let ref;
      let results;
      results = [];
      for (
        i = k = 0, ref = points.length;
        0 <= ref ? k < ref : k > ref;
        i = 0 <= ref ? ++k : --k
      ) {
        results.push(sqDist(i, neighbors[i][K - 1]));
      }
      return results;
    })();
    reachDist = (i, j) => Math.max(sqDist(i, j), kdists[j]);
    ldr = i => {
      let j;
      let k;
      let len;
      let rDist;
      let ref;
      rDist = 0;
      ref = neighbors[i];
      for (k = 0, len = ref.length; k < len; k++) {
        j = ref[k];
        rDist += reachDist(i, j);
      }
      return K / rDist;
    };
    ldrs = (() => {
      let k;
      let ref;
      let results;
      results = [];
      for (
        i = k = 0, ref = points.length;
        0 <= ref ? k < ref : k > ref;
        i = 0 <= ref ? ++k : --k
      ) {
        results.push(ldr(i));
      }
      return results;
    })();
    result = (() => {
      let k;
      let l;
      let len;
      let ref;
      let ref1;
      let results;
      results = [];
      for (
        i = k = 0, ref = points.length;
        0 <= ref ? k < ref : k > ref;
        i = 0 <= ref ? ++k : --k
      ) {
        avg_lrd = 0;
        ref1 = neighbors[i];
        for (l = 0, len = ref1.length; l < len; l++) {
          j = ref1[l];
          avg_lrd += ldrs[j];
        }
        avg_lrd /= K;
        results.push([i, avg_lrd / ldrs[i]]);
      }
      return results;
    })();
    return result.sort((a, b) => b[1] - a[1]);
  };
}).call(this);
