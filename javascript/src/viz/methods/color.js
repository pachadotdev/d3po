(function() {
    var filter, scale;

    filter = require("../../core/methods/filter.js");

    scale = require("../../color/scale.js");

    module.exports = {
        accepted: [false, Array, Function, Object, String],
        domain: {
            accepted: [false, Array],
            value: false
        },
        focus: "#444444",
        // heatmap: ["#ffeedd", "#ffd7b5", "#ffb38a", "#ff9248", "#ff6700"],
        // heatmap: ["#eeaf61", "#fb9062", "#ee5d6c", "#ce4993", "#6a0d83"],
        // heatmap: ["#ffdef5", "#ffa6fc", "#ff94e0", "#ff76d8", "#ff59c7"],
        heatmap: ["#a8dfc7", "#8dd1b9", "#6cc3ab", "#4cb59d", "#317256"],
        missing: "#eeeeee",
        mute: filter(true),
        primary: "#d74b03",
        range: ["#B22200", "#FFEE8D", "#759143"],
        scale: {
            accepted: [Array, Function, "d3po", "category10", "category20", "category20b", "category20c"],
            process: function(value) {
                if (value instanceof Array) {
                    return d3.scale.ordinal().range(value);
                } else if (value === "d3po") {
                    return scale;
                } else if (typeof value === "string") {
                    return d3.scale[value]();
                } else {
                    return value;
                }
            },
            value: "d3po"
        },
        solo: filter(true),
        secondary: "#e5b3bb",
        value: false
    };

}).call(this);