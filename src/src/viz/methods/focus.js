(() => {
  module.exports = {
    accepted: [false, Array, Function, Number, String],
    process: function(value) {
      if (value === false) {
        return [];
      } else if (value instanceof Array) {
        return value;
      } else {
        return [value];
      }
    },
    tooltip: {
      accepted: [Boolean],
      value: true
    },
    value: []
  };
}).call(this);
