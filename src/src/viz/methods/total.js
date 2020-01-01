(function() {
  var filter;

  filter = require('../../core/methods/filter.js');

  module.exports = {
    accepted: [false, Function, Object, String],
    mute: filter(true),
    solo: filter(true),
    value: false
  };
}.call(this));
