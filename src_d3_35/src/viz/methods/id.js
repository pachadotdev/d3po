(function() {
    var filter;

    filter = require("../../core/methods/filter.js");

    module.exports = {
        accepted: [Array, String],
        dataFilter: true,
        grouping: {
            accepted: [Boolean],
            value: true
        },
        mute: filter(true),
        nesting: ["id"],
        solo: filter(true),
        value: "id"
    };

}).call(this);