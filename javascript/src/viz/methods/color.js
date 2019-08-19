(function() {
    var filter, scale;

    filter = require("../../core/methods/filter.js");

    scale = require("../../color/scale.js");

    schemes = require("../../color/schemes.js");

    module.exports = {
        accepted: [false, Array, Function, Object, String],
        domain: {
            accepted: [false, Array],
            value: false
        },
        focus: "#444444",
        heatmap: ["#282F6B", "#419391", "#AFD5E8", "#EACE3F", "#B35C1E", "#B22200"],
        missing: "#eeeeee",
        mute: filter(true),
        primary: "#d74b03",
        range: ["#B22200", "#FFEE8D", "#759143"],
        scale: {
            accepted: [Array, Function, "d3po"].concat(schemes.allowedStrings),
            process: function(value) {
                if (value instanceof Array) {
                    return d3.scaleOrdinal().range(value);
                } else if (value === "d3po") {
                    return scale;
                } else if (typeof value === "string") {
                    return schemes.fromString(value)();
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