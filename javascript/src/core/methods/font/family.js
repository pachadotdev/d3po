// Constructs font family property using the validate function
(function() {
  var fira, validate;

  validate = require("../../../font/validate.js");

  fira = ["Fira Sans", "sans-serif"];

  module.exports = function(family) {
    if (family === void 0) {
      family = fira;
    }
    return {
      process: validate,
      value: family
    };
  };

}).call(this);
