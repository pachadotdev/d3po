(function() {
  var angles, largestRect, path2poly, shapeStyle;

  shapeStyle = require('./style.js');

  largestRect = require('../../../geom/largestrectangle.js');

  path2poly = require('../../../geom/path2poly.js');

  angles = {
    start: {},
    end: {}
  };

  module.exports = function(vars, selection, enter, exit) {
    var arc, arcTween, data, newarc;
    arc = d3.svg
      .arc()
      .innerRadius(function(d) {
        return d.d3po.r_inner;
      })
      .outerRadius(function(d) {
        return d.d3po.r_outer;
      })
      .startAngle(function(d) {
        return d.d3po.startAngle;
      })
      .endAngle(function(d) {
        return d.d3po.endAngle;
      });
    data = function(d) {
      var poly, rect;
      if (vars.labels.value) {
        if (d.d3po.label) {
          d.d3po_label = d.d3po.label;
        } else if (d.d3po.endAngle - d.d3po.startAngle >= 0.1) {
          poly = path2poly(arc(d));
          rect = largestRect(poly, {
            angle: 0
          });
          if (rect[0]) {
            d.d3po_label = {
              w: rect[0].width,
              h: rect[0].height,
              x: rect[0].cx,
              y: rect[0].cy
            };
          } else {
            delete d.d3po_label;
          }
        } else {
          delete d.d3po_label;
        }
      }
      return [d];
    };
    if (vars.draw.timing) {
      newarc = d3.svg
        .arc()
        .innerRadius(function(d) {
          return d.d3po.r_inner;
        })
        .outerRadius(function(d) {
          return d.d3po.r_outer;
        })
        .startAngle(function(d) {
          if (angles.start[d.d3po.id] === void 0) {
            angles.start[d.d3po.id] = 0;
          }
          if (isNaN(angles.start[d.d3po.id])) {
            angles.start[d.d3po.id] = d.d3po.startAngle;
          }
          return angles.start[d.d3po.id];
        })
        .endAngle(function(d) {
          if (angles.end[d.d3po.id] === void 0) {
            angles.end[d.d3po.id] = 0;
          }
          if (isNaN(angles.end[d.d3po.id])) {
            angles.end[d.d3po.id] = d.d3po.endAngle;
          }
          return angles.end[d.d3po.id];
        });
      arcTween = function(arcs, newAngle) {
        return arcs.attrTween('d', function(d) {
          var e, interpolateE, interpolateS, s;
          if (newAngle === void 0) {
            s = d.d3po.startAngle;
            e = d.d3po.endAngle;
          } else if (newAngle === 0) {
            s = 0;
            e = 0;
          }
          interpolateS = d3.interpolate(angles.start[d.d3po.id], s);
          interpolateE = d3.interpolate(angles.end[d.d3po.id], e);
          return function(t) {
            angles.start[d.d3po.id] = interpolateS(t);
            angles.end[d.d3po.id] = interpolateE(t);
            return newarc(d);
          };
        });
      };
      enter
        .append('path')
        .attr('class', 'd3po_data')
        .call(shapeStyle, vars)
        .attr('d', newarc);
      selection
        .selectAll('path.d3po_data')
        .data(data)
        .transition()
        .duration(vars.draw.timing)
        .call(shapeStyle, vars)
        .call(arcTween);
      exit
        .selectAll('path.d3po_data')
        .transition()
        .duration(vars.draw.timing)
        .call(arcTween, 0);
    } else {
      enter.append('path').attr('class', 'd3po_data');
      selection
        .selectAll('path.d3po_data')
        .data(data)
        .call(shapeStyle, vars)
        .attr('d', arc);
    }
  };
}.call(this));
