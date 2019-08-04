var fetchText = require("../../../core/fetch/text.js"),
  fontSizes = require("../../../font/sizes.js"),
  largestRect = require("../../../geom/largestrectangle.js"),
  shapeStyle = require("./style.js");
//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
// Draws "square" and "circle" shapes using svg:rect
//------------------------------------------------------------------------------
module.exports = function(vars, selection, enter, exit) {

  //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // D3 area definition
  //----------------------------------------------------------------------------
  var area = d3.svg.area()
    .x(function(d) {
      return d.d3po.x;
    })
    .y0(function(d) {
      return d.d3po.y0;
    })
    .y1(function(d) {
      return d.d3po.y;
    })
    .interpolate(vars.shape.interpolate.value);

  var startArea = d3.svg.area()
    .x(function(d) {
      return d.d3po.x;
    })
    .y0(function(d) {
      return d.d3po.y0;
    })
    .y1(function(d) {
      return d.d3po.y0;
    })
    .interpolate(vars.shape.interpolate.value);

  //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // "paths" Enter
  //----------------------------------------------------------------------------
  enter.append("path").attr("class", "d3po_data")
    .attr("d", function(d) {
      return startArea(d.values);
    })
    .call(shapeStyle, vars);

  //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // "paths" Update
  //----------------------------------------------------------------------------

  var style = {
    "font-weight": vars.labels.font.weight,
    "font-family": vars.labels.font.family.value
  };

  selection.selectAll("path.d3po_data")
    .data(function(d) {

      if (vars.labels.value && d.values.length > 1) {

        var max = d3.max(d.values, function(v) {
            return v.d3po.y0 - v.d3po.y;
          }),
          lr = false;

        if (max > vars.labels.font.size) {

          var tops = [],
            bottoms = [],
            names = fetchText(vars, d);

          d.values.forEach(function(v) {
            tops.push([v.d3po.x, v.d3po.y]);
            bottoms.push([v.d3po.x, v.d3po.y0]);
          });
          tops = tops.concat(bottoms.reverse());

          var ratio = null;
          if (names.length) {
            var size = fontSizes(names[0], style);
            ratio = size[0].width / size[0].height;
          }

          lr = largestRect(tops, {
            "angle": d3.range(-70, 71, 1),
            "aspectRatio": ratio,
            "tolerance": 0
          });

        }

        if (lr && lr[0]) {

          var label = {
            "w": ~~(lr[0].width),
            "h": ~~(lr[0].height),
            "x": ~~(lr[0].cx),
            "y": ~~(lr[0].cy),
            "angle": lr[0].angle * -1,
            "padding": 2,
            "names": names
          }

          if (lr[0].angle !== 0) {
            label.translate = {
              "x": label.x,
              "y": label.y
            }
          } else {
            label.translate = false
          }

          if (label.w >= 10 && label.h >= 10) {
            d.d3po_label = label
          }

        }

      }

      return [d];
    })

  if (vars.draw.timing) {
    selection.selectAll("path.d3po_data")
      .transition().duration(vars.draw.timing)
      .attr("d", function(d) {
        return area(d.values)
      })
      .call(shapeStyle, vars)
  } else {
    selection.selectAll("path.d3po_data")
      .attr("d", function(d) {
        return area(d.values)
      })
      .call(shapeStyle, vars)
  }

}
