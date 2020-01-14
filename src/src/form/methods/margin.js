(() => {
  var process;

  process = require('../../core/methods/process/margin.js');

  module.exports = {
    accepted: [Number, Object, String],
    process: function(value) {
      var userValue;
      if (value === void 0) {
        value = this.value;
      }
      userValue = value;
      process(value, this);
      return userValue;
    },
    value: 0
  };
}).call(this);
