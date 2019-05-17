shapeStyle = require("./style.coffee")

module.exports = (vars, selection, enter, exit) ->

  # Calculate label position and pass data from parent.
  data = (d) ->

    if vars.labels.value and not d.d3po.label

      w = (if d.d3po.r then d.d3po.r * 2 else d.d3po.width)
      h = (if d.d3po.r then d.d3po.r * 2 else d.d3po.height)

      d.d3po_label =
        w: w
        h: h
        x: 0
        y: 0

      d.d3po_share =
        w: w
        h: h
        x: 0
        y: 0

      d.d3po_label.shape = (if d.d3po.shape is "circle" then "circle" else "square")

    else if d.d3po.label
      d.d3po_label = d.d3po.label
    else
      delete d.d3po_label

    [d]

  #^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  # The position and size of each rectangle on enter and exit.
  #----------------------------------------------------------------------------
  init = (nodes) ->
    nodes
      .attr "x", (d) ->
        if d.d3po.init and "x" of d.d3po.init
          d.d3po.init.x
        else
          if d.d3po.init and "width" of d.d3po.init then -d.d3po.width/2 else 0
      .attr "y", (d) ->
        if d.d3po.init and "y" of d.d3po.init
          d.d3po.init.y
        else
          if d.d3po.init and "height" of d.d3po.init then -d.d3po.height/2 else 0
      .attr "width", (d) ->
        if d.d3po.init and "width" of d.d3po.init then d.d3po.init.width else 0
      .attr "height", (d) ->
        if d.d3po.init and "height" of d.d3po.init then d.d3po.init.height else 0

  #^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  # The position and size of each rectangle on update.
  #----------------------------------------------------------------------------
  update = (nodes) ->
    nodes
      .attr "x", (d) ->
        w = if d.d3po.r then d.d3po.r * 2 else d.d3po.width
        -w / 2
      .attr "y", (d) ->
        h = if d.d3po.r then d.d3po.r * 2 else d.d3po.height
        -h / 2
      .attr "width", (d) ->
        if d.d3po.r then d.d3po.r * 2 else d.d3po.width
      .attr "height", (d) ->
        if d.d3po.r then d.d3po.r * 2 else d.d3po.height
      .attr "rx", (d) ->
        rounded = d.d3po.shape is "circle"
        w = if d.d3po.r then d.d3po.r * 2 else d.d3po.width
        if rounded then (w + 2) / 2 else 0
      .attr "ry", (d) ->
        rounded = d.d3po.shape is "circle"
        h = if d.d3po.r then d.d3po.r * 2 else d.d3po.height
        if rounded then (h + 2) / 2 else 0
      .attr "transform", (d) ->
        if "rotate" of d.d3po then "rotate(" + d.d3po.rotate + ")" else ""
      .attr "shape-rendering", (d) ->
        if d.d3po.shape is "square" and ("rotate" not of d.d3po)
          vars.shape.rendering.value
        else
          "auto"

  if vars.draw.timing
    enter.append("rect")
      .attr("class", "d3po_data")
      .call(init)
      .call shapeStyle, vars

    selection.selectAll("rect.d3po_data")
      .data(data).transition().duration vars.draw.timing
      .call(update).call shapeStyle, vars

    exit.selectAll("rect.d3po_data")
      .transition().duration vars.draw.timing
      .call init
  else
    enter.append("rect")
      .attr "class", "d3po_data"

    selection.selectAll("rect.d3po_data")
      .data(data).call(update).call shapeStyle, vars
