(function() {
    var filter;

    filter = require("../../core/methods/filter.js");

    module.exports = {
        accepted: [Array, Boolean, Function, Object, String],
        nesting: true,
        mute: filter(true),
        solo: filter(true),
        value: false
    };

}).call(this);