comparator = require "./comparator.coffee"
fetchSort  = require "../core/fetch/sort.coffee"

# Sorts an array of objects
module.exports = (arr, keys, sort, colors, vars, depth) ->

  if not arr or arr.length <= 1
    arr or []
  else

    if vars

      keys = vars.order.value or vars.size.value or vars.id.value unless keys
      sort = vars.order.sort.value unless sort
      colors = vars.color.value or [] unless colors

      for d in arr
        d.d3po = {} unless d.d3po
        data = if "d3po" of d and "d3po" of d.d3po then d.d3po else d
        d.d3po.sortKeys = fetchSort vars, data, keys, colors, depth

    arr.sort (a, b) -> comparator a, b, keys, sort, colors, vars, depth
