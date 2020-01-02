(function() {
  var filter;

  filter = require('../../core/methods/filter.js');

  module.exports = {
    accepted: [false, Array, Function, Object, String],
    mute: filter(true),
    solo: filter(true),
    value: 'keywords'
  };
}.call(this));
