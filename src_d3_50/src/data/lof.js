// Finds outliers in n-dim data using the Local Outlier Factor algorithm
(function() {
    var kdtree;

    kdtree = require('static-kdtree');

    module.exports = function(points, K) {
        var avg_lrd, i, j, kdists, ldr, ldrs, neighbors, p, reachDist, result, sqDist, tree;
        if (K == null) {
            K = 10;
        }
        tree = kdtree(points);
        neighbors = (function() {
            var k, len, results;
            results = [];
            for (k = 0, len = points.length; k < len; k++) {
                p = points[k];
                results.push(tree.knn(p, K + 1).slice(1));
            }
            return results;
        })();
        sqDist = function(i, j) {
            var A, B, delta, dist, k, ref;
            A = points[i];
            B = points[j];
            dist = 0;
            for (i = k = 0, ref = A.length; 0 <= ref ? k < ref : k > ref; i = 0 <= ref ? ++k : --k) {
                delta = A[i] - B[i];
                dist += delta * delta;
            }
            return dist;
        };
        kdists = (function() {
            var k, ref, results;
            results = [];
            for (i = k = 0, ref = points.length; 0 <= ref ? k < ref : k > ref; i = 0 <= ref ? ++k : --k) {
                results.push(sqDist(i, neighbors[i][K - 1]));
            }
            return results;
        })();
        reachDist = function(i, j) {
            return Math.max(sqDist(i, j), kdists[j]);
        };
        ldr = function(i) {
            var j, k, len, rDist, ref;
            rDist = 0;
            ref = neighbors[i];
            for (k = 0, len = ref.length; k < len; k++) {
                j = ref[k];
                rDist += reachDist(i, j);
            }
            return K / rDist;
        };
        ldrs = (function() {
            var k, ref, results;
            results = [];
            for (i = k = 0, ref = points.length; 0 <= ref ? k < ref : k > ref; i = 0 <= ref ? ++k : --k) {
                results.push(ldr(i));
            }
            return results;
        })();
        result = (function() {
            var k, l, len, ref, ref1, results;
            results = [];
            for (i = k = 0, ref = points.length; 0 <= ref ? k < ref : k > ref; i = 0 <= ref ? ++k : --k) {
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
        return result.sort(function(a, b) {
            return b[1] - a[1];
        });
    };

}).call(this);