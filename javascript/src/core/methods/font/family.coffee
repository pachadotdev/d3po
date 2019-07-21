validate  = require "../../../font/validate.coffee"
fira = ["Fira Sans", "sans-serif"]

# Constructs font family property using the validate function
module.exports = (family) ->

  family = fira if family is undefined

  process: validate
  value:   family
