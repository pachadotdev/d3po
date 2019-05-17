fetchValue = require "../../../core/fetch/value.coffee"

module.exports = (vars, d, segment) ->
  ret = vars[segment].value
  if ret
    if segment of d.d3po then d.d3po[segment] else fetchValue vars, d, ret
  else
    d.d3po[segment]
