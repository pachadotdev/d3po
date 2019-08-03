// Calculates the correct CSS vendor prefix based on the current browser
(function() {
  var prefix;

  prefix = function() {
    var val;
    if ("-webkit-transform" in document.body.style) {
      val = "-webkit-";
    } else if ("-moz-transform" in document.body.style) {
      val = "-moz-";
    } else if ("-ms-transform" in document.body.style) {
      val = "-ms-";
    } else if ("-o-transform" in document.body.style) {
      val = "-o-";
    } else {
      val = "";
    }
    prefix = function() {
      return val;
    };
    return val;
  };

  module.exports = prefix;

}).call(this);
