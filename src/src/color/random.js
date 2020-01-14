// Returns a random color
(() => {
  var defaultScale;

  defaultScale = require('./scale.js');

  module.exports = (x, scale) => {
    var rand_int;
    rand_int = x || Math.floor(Math.random() * 20);
    scale = scale || defaultScale;
    return scale(rand_int);
  };
}).call(this);
