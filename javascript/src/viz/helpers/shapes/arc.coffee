shapeStyle  = require "./style.coffee"
largestRect = require "../../../geom/largestrectangle.js"
path2poly   = require "../../../geom/path2poly.js"
angles      = {start: {}, end: {}}

module.exports = (vars, selection, enter, exit) ->

  arc = d3.svg.arc()
    .innerRadius (d) -> d.d3po.r_inner
    .outerRadius (d) -> d.d3po.r_outer
    .startAngle (d) -> d.d3po.startAngle
    .endAngle (d) -> d.d3po.endAngle

  # Calculate label position and pass data from parent.
  data = (d) ->
    if vars.labels.value
      if d.d3po.label
        d.d3po_label = d.d3po.label
      else if d.d3po.endAngle - d.d3po.startAngle >= 0.1
        poly = path2poly(arc(d))
        rect = largestRect poly,
          angle: 0
        if rect[0]
          d.d3po_label =
            w: rect[0].width
            h: rect[0].height
            x: rect[0].cx
            y: rect[0].cy
        else
          delete d.d3po_label
      else
        delete d.d3po_label
    [d]

  if vars.draw.timing

    newarc = d3.svg.arc()
      .innerRadius (d) -> d.d3po.r_inner
      .outerRadius (d) -> d.d3po.r_outer
      .startAngle (d) ->
        angles.start[d.d3po.id] = 0 if angles.start[d.d3po.id] is undefined
        angles.start[d.d3po.id] = d.d3po.startAngle if isNaN(angles.start[d.d3po.id])
        angles.start[d.d3po.id]
      .endAngle (d) ->
        angles.end[d.d3po.id] = 0 if angles.end[d.d3po.id] is undefined
        angles.end[d.d3po.id] = d.d3po.endAngle if isNaN(angles.end[d.d3po.id])
        angles.end[d.d3po.id]

    arcTween = (arcs, newAngle) ->
      arcs.attrTween "d", (d) ->

        if newAngle is undefined
          s = d.d3po.startAngle
          e = d.d3po.endAngle
        else if newAngle is 0
          s = 0
          e = 0

        interpolateS = d3.interpolate(angles.start[d.d3po.id], s)
        interpolateE = d3.interpolate(angles.end[d.d3po.id], e)
        (t) ->
          angles.start[d.d3po.id] = interpolateS(t)
          angles.end[d.d3po.id] = interpolateE(t)
          newarc d

    enter.append("path")
      .attr "class", "d3po_data"
      .call shapeStyle, vars
      .attr "d", newarc

    selection.selectAll("path.d3po_data").data data
      .transition().duration vars.draw.timing
      .call shapeStyle, vars
      .call arcTween

    exit.selectAll("path.d3po_data")
      .transition().duration vars.draw.timing
      .call arcTween, 0

  else

    enter.append("path").attr "class", "d3po_data"

    selection.selectAll("path.d3po_data").data data
      .call shapeStyle, vars
      .attr "d", arc

  return
