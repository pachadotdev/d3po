(function() {
    var process, rendering;

    process = require("../../core/methods/process/margin.js");

    rendering = require("../../core/methods/rendering.js");

    module.exports = {
        background: {
            color: "#ebebeb",
            rendering: rendering(),
            stroke: {
                color: "#ffffff",
                width: 1
            }
        },
        margin: {
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
            value: 10
        },
        mirror: {
            accepted: [Boolean],
            value: false
        },
        ticks: {
            accepted: [Boolean],
            value: true
        }
    };

}).call(this);