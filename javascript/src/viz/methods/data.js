(function() {
    var process;

    process = require("../../core/methods/process/data.js");

    module.exports = {
        accepted: [false, Array, Function, String],
        cache: {},
        delimiter: {
            accepted: [String],
            value: "|"
        },
        filetype: {
            accepted: [false, "json", "xml", "html", "csv", "dsv", "tsv", "txt"],
            value: false
        },
        filters: [],
        keys: {},
        mute: [],
        large: 400,
        opacity: 0.9,
        padding: {
            accepted: [Number],
            value: 1
        },
        process: function(value, vars) {
            return process(value, vars, this);
        },
        solo: [],
        stroke: {
            width: 1
        },
        value: false
    };

}).call(this);
