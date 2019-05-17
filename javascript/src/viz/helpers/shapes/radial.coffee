shapeStyle   = require "./style.coffee"
radii        = {}
angles       = {}
interpolates = {r: {}, a: {}}

module.exports = (vars, selection, enter, exit) ->

  nextLevel = vars.id.nesting[vars.depth.value + 1]
  radial = d3.svg.line.radial()
    .interpolate "linear-closed"
    .radius (d) -> d.d3po.r
    .angle (d) -> d.d3po.a

  # Calculate label position and pass data from parent.
  data = (d) ->
    if vars.labels.value
      if d.d3po.label
        d.d3po_label = d.d3po.label
      else
        delete d.d3po_label
    [d]

  if vars.draw.timing

    selection.each (d) ->
      for c in d[nextLevel]
        c.d3po.id = c[vars.id.value] + "_" + c[nextLevel]

    newRadial = d3.svg.line.radial()
      .interpolate "linear-closed"
      .radius (d, i) ->
        radii[d.d3po.id] = 0 if radii[d.d3po.id] is undefined
        radii[d.d3po.id] = d.d3po.r if isNaN(radii[d.d3po.id])
        radii[d.d3po.id]
      .angle (d, i) ->
        angles[d.d3po.id] = d.d3po.a if angles[d.d3po.id] is undefined
        angles[d.d3po.id] = d.d3po.a if isNaN(angles[d.d3po.id])
        angles[d.d3po.id]

    radialTween = (arcs, newRadius) ->
      arcs.attrTween "d", (d) ->

        for c, i in d[nextLevel]

          a = c.d3po.a
          if newRadius is undefined
            r = c.d3po.r
          else if newRadius is 0
            r = 0

          interpolates.a[c.d3po.id] = d3.interpolate(angles[c.d3po.id], a)
          interpolates.r[c.d3po.id] = d3.interpolate(radii[c.d3po.id], r)

        (t) ->
          for c, i in d[nextLevel]
            angles[c.d3po.id] = interpolates.a[c.d3po.id](t)
            radii[c.d3po.id] = interpolates.r[c.d3po.id](t)
          newRadial d[nextLevel]

    enter.append("path")
      .attr "class", "d3po_data"
      .call shapeStyle, vars
      .attr "d", (d) -> newRadial(d[nextLevel])

    selection.selectAll("path.d3po_data").data data
      .transition().duration vars.draw.timing
      .call shapeStyle, vars
      .call radialTween

    exit.selectAll("path.d3po_data")
      .transition().duration vars.draw.timing
      .call radialTween, 0

  else

    enter.append("path").attr "class", "d3po_data"

    selection.selectAll("path.d3po_data").data data
      .call shapeStyle, vars
      .attr "d", (d) -> radial(d[nextLevel])

  return
