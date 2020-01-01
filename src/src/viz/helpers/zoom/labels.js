(function() {
  var print;

  print = require('../../../core/console/print.js');

  module.exports = function(vars) {
    var opacity, scale;
    if (vars.dev.value) {
      print.time('determining label visibility');
    }
    scale = vars.zoom.behavior.scaleExtent();
    opacity = function(text) {
      return text.attr('opacity', function(d) {
        var size;
        if (!d) {
          d = {};
        }
        size = parseFloat(d3.select(this).attr('font-size'), 10);
        d.visible = size * (vars.zoom.scale / scale[1]) >= 2;
        if (d.visible) {
          return 1;
        } else {
          return 0;
        }
      });
    };
    if (vars.draw.timing) {
      vars.g.viz
        .selectAll('text.d3po_label')
        .transition()
        .duration(vars.draw.timing)
        .call(opacity);
    } else {
      vars.g.viz.selectAll('text.d3po_label').call(opacity);
    }
    if (vars.dev.value) {
      return print.timeEnd('determining label visibility');
    }
  };
}.call(this));
