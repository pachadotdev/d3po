filter = require "../../core/methods/filter.coffee"

module.exports =
  accepted:   [Array, Boolean, Function, Object, String]
  dataFilter: true
  fixed:
    accepted:   [Boolean]
    value:      false
  format:
    accepted: [false, Array, Function, String]
    value:    false
  mute:       filter(false)
  solo:       filter(false)
  value:      false
