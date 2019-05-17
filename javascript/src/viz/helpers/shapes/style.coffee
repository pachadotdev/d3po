color = require "./color.coffee"
ie    = require "../../../client/ie.js"
value = require "../../../core/fetch/value.coffee"

# Fill style for all shapes
module.exports = (nodes, vars) ->

  nodes
    .attr "fill", (d) ->
      if d.d3po and d.d3po.spline then "none" else color d, vars
    .style "stroke", (d) ->
      if d.d3po and d.d3po.stroke
        d.d3po.stroke
      else
        c = if d.values then color(d.values[0], vars) else color(d, vars, true)
        d3.rgb(c).darker 0.6
    .style "stroke-width", (d) ->
      return 0 if ie and vars.types[vars.type.value].zoom
      if d.d3po.shape is "line" and vars.size.value
        return vars.size.value if vars.size.value.constructor is Number
        v = value(vars, d, vars.size.value)
        return d3.max v if v and v.length
      vars.data.stroke.width
    .attr "opacity", vars.data.opacity
    .attr "vector-effect", "non-scaling-stroke"
