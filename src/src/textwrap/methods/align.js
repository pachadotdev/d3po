(function() {
  module.exports = {
    accepted: [false, 'start', 'middle', 'end', 'left', 'center', 'right'],
    process: function(value) {
      var css;
      css = ['left', 'center', 'right'].indexOf(value);
      if (css >= 0) {
        value = this.accepted[css + 1];
      }
      return value;
    },
    value: false
  };
}.call(this));
