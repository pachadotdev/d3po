module.exports = (vars, selection, enter, exit) ->

  data = (d) ->

    if d.d3po.text
      d.d3po_label =
        w:          size
        h:          size
        x:          0
        y:          0
        background: "#fff"
        resize:     false
        angle:      if ["left","right"].indexOf(d.d3po.position) >= 0 then 90 else 0
    else if d.d3po.label
      d.d3po_label = d.d3po.label
    else delete d.d3po_label

    [d]

  style = (line) ->
    line
      .style "stroke-width", vars.data.stroke.width
      .style "stroke", "#444"
      .attr "fill", "none"
      .attr "shape-rendering", vars.shape.rendering.value

  init = (line) ->
    line
      .attr "x1", 0
      .attr "x2", 0
      .attr "y1", 0
      .attr "y2", 0

  position = (line) ->
    line
      .attr "x1", (d) ->
        if ["top","bottom"].indexOf(d.d3po.position) >= 0 then 0
        else
          offset = d.d3po.offset or 0
          w = d.d3po.width or 0
          x = if offset < 0 then -w else w
          x + offset
      .attr "x2", (d) ->
        if ["top","bottom"].indexOf(d.d3po.position) >= 0 then 0 else d.d3po.offset or 0
      .attr "y1", (d) ->
        if ["left","right"].indexOf(d.d3po.position) >= 0 then 0
        else
          offset = d.d3po.offset or 0
          h = d.d3po.height or 0
          y = if offset < 0 then -h else h
          y + offset
      .attr "y2", (d) ->
        if ["left","right"].indexOf(d.d3po.position) >= 0 then 0 else d.d3po.offset or 0
      .attr "marker-start", "url(#d3po_whisker_marker)"

  marker = vars.defs.selectAll("#d3po_whisker_marker").data [0]

  marker.enter().append("marker")
    .attr "id", "d3po_whisker_marker"
    .attr "markerUnits", "userSpaceOnUse"
    .style "overflow", "visible"
    .append "line"

  d = selection.datum()
  if d
    pos    = d.d3po.position
    orient = if ["top","bottom"].indexOf(pos) >= 0 then "horizontal" else "vertical"
    size   = if orient is "horizontal" then d.d3po.width else d.d3po.height
  else
    orient = "horizontal"
    size   = 0

  marker.select "line"
    .attr "x1", if orient is "horizontal" then -size/2 else 0
    .attr "x2", if orient is "horizontal" then size/2 else 0
    .attr "y1", if orient is "vertical" then -size/2 else 0
    .attr "y2", if orient is "vertical" then size/2 else 0
    .call style
    .style "stroke-width", vars.data.stroke.width * 2

  if vars.draw.timing

    enter.append("line")
      .attr "class", "d3po_data"
      .call style
      .call init

    selection.selectAll("line.d3po_data").data data
      .transition().duration vars.draw.timing
      .call style
      .call position

    exit.selectAll("line.d3po_data")
      .transition().duration vars.draw.timing
      .call init

  else

    enter.append("line").attr "class", "d3po_data"
    selection.selectAll("line.d3po_data").data data
      .call style
      .call position

  return
