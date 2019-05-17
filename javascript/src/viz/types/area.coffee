closest    = require "../../util/closest.coffee"
fetchValue = require "../../core/fetch/value.coffee"
graph      = require "./helpers/graph/draw.coffee"
nest       = require "./helpers/graph/nest.coffee"
sort       = require "../../array/sort.coffee"
stack      = require "./helpers/graph/stack.coffee"
threshold  = require "../../core/data/threshold.js"

# Area Chart
area = (vars) ->

  graph vars,
    buffer: vars.axes.opposite
    zero: true

  domains = vars.x.domain.viz.concat vars.y.domain.viz
  return [] if domains.indexOf(undefined) >= 0

  data = sort vars.data.viz, null, null, null, vars
  discrete = vars[vars.axes.discrete]
  opposite = vars[vars.axes.opposite]

  # Assign x and y to each data point
  for point in data
    point.d3po = {} unless point.d3po
    for d in point.values

      d.d3po = {} unless d.d3po

      d.d3po.x  = discrete.scale.viz fetchValue vars, d, discrete.value
      d.d3po.x += vars.axes.margin.viz.left

      d.d3po.y  = opposite.scale.viz fetchValue vars, d, opposite.value
      d.d3po.y += vars.axes.margin.viz.top

      if d.d3po.merged instanceof Array
        point.d3po.merged = [] unless point.d3po.merged
        point.d3po.merged = point.d3po.merged.concat(d.d3po.merged)
      point.d3po.text = d.d3po.text if d.d3po.text and !point.d3po.text

  stack vars, data

# Visualization Settings and Helper Functions
area.filter = (vars, data) ->
  nest vars, threshold(vars, data, vars[vars.axes.discrete].value)
area.requirements = ["data", "x", "y"]
area.setup = (vars) ->

  unless vars.axes.discrete
    axis = if vars.time.value is vars.y.value then "y" else "x"
    vars.self[axis] scale: "discrete"

  unless vars[vars.axes.discrete].zerofill.value
    vars.self[vars.axes.discrete] zerofill: true
  if !vars[vars.axes.opposite].stacked.value and vars.type.value is "stacked"
    vars.self[vars.axes.opposite] stacked: true

  y    = vars[vars.axes.opposite]
  size = vars.size

  if (not y.value and size.value) or
     (size.changed and size.previous is y.value)
    vars.self[vars.axes.opposite] size.value
  else if (not size.value and y.value) or
          (y.changed and y.previous is size.value)
    vars.self.size y.value

area.shapes = ["area"]
area.threshold = (vars) -> 20 / vars.height.viz
area.tooltip = "static"
module.exports  = area
