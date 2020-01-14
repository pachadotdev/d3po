// Returns a random color
(() => {
  let defaultScale;

  defaultScale = require('./scale.js');

  module.exports = (x, scale) => {
    let rand_int;
    rand_int = x || Math.floor(Math.random() * 20);
    scale = scale || defaultScale;
    return scale(rand_int);
  };
}).call(this);
