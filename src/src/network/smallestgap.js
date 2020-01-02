// Returns distances of all objects in array
(function() {
  var distance;

  distance = require('./distance.js');

  module.exports = function(arr, opts) {
    var distances, quad;
    if (!opts) {
      opts = {};
    }
    distances = [];
    quad = d3.geom
      .quadtree()
      .x(function(d) {
        if (opts.accessor) {
          return opts.accessor(d)[0];
        } else {
          return d[0];
        }
      })
      .y(function(d) {
        if (opts.accessor) {
          return opts.accessor(d)[1];
        } else {
          return d[1];
        }
      });
    quad(arr).visit(function(node) {
      var i, j, len, len1, n1, n2, ref, ref1;
      if (!node.leaf) {
        ref = node.nodes;
        for (i = 0, len = ref.length; i < len; i++) {
          n1 = ref[i];
          if (n1 && n1.point) {
            if (opts.origin) {
              distances.push(distance(n1, opts));
            } else {
              ref1 = node.nodes;
              for (j = 0, len1 = ref1.length; j < len1; j++) {
                n2 = ref1[j];
                if (n2 && n2.point && n2.point !== n1.point) {
                  distances.push(distance(n1, n2));
                }
              }
            }
          }
        }
      }
      return false;
    });
    if (opts.all) {
      return distances.sort(function(aa, bb) {
        return aa - bb;
      });
    } else {
      return d3.min(distances);
    }
  };
}.call(this));
