filter = require "../../core/methods/filter.js"

module.exports =
  accepted:   [false, Function, Object, String]
  mute:       filter true
  solo:       filter true
  spotlight:
    accepted:   [Boolean]
    value:      false
  value:      false
