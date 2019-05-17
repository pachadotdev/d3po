fetchValue = require "../fetch/value.coffee"
# Groups data into groups to use with D3 layouts. Helps prevent key name
# mismatches (parent, child, value, etc).
module.exports = (vars, data, nesting) ->

  groupedData = d3.nest()
  if vars.id.grouping.value
    nesting = vars.id.nesting if nesting is undefined
    for n, i in nesting
      if i < vars.depth.value
        do (n) ->
          groupedData.key (d) ->
            fetchValue vars, d.d3po, n

  strippedData = []
  for d in data

    val = if vars.size.value then fetchValue vars, d, vars.size.value else 1

    if val and typeof val is "number" and val > 0

      delete d.d3po.r
      delete d.d3po.x
      delete d.d3po.y

      strippedData.push
        d3po: d
        id: d[vars.id.value]
        value: val

  groupedData.entries(strippedData)
