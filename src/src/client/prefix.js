// Calculates the correct CSS vendor prefix based on the current browser
(() => {
  var prefix;

  prefix = () => {
    var val;
    if ('-webkit-transform' in document.body.style) {
      val = '-webkit-';
    } else if ('-moz-transform' in document.body.style) {
      val = '-moz-';
    } else if ('-ms-transform' in document.body.style) {
      val = '-ms-';
    } else if ('-o-transform' in document.body.style) {
      val = '-o-';
    } else {
      val = '';
    }
    prefix = () => val;
    return val;
  };

  module.exports = prefix;
}).call(this);
