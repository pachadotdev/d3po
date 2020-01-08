(function() {
  module.exports = function(g) {
    if (!g) {
      g = false;
    }
    return {
      accepted: [false, Array, Function, Number, Object, String],
      callback: {
        accepted: [false, Function],
        value: false
      },
      global: g,
      process: Array,
      value: []
    };
  };
}.call(this));
