validate  = require "../../../font/validate.coffee"
openfonts = ["Fira Sans", "Source Sans Pro", "Open Sans", "sans-serif"]

# Constructs font family property using the validate function
module.exports = (family) ->

  family = openfonts if family is undefined

  process: validate
  value:   family
