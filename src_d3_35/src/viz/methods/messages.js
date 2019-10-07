(function() {
    var decoration, family, transform;

    decoration = require("../../core/methods/font/decoration.js");

    family = require("../../core/methods/font/family.js");

    transform = require("../../core/methods/font/transform.js");

    module.exports = {
        accepted: [Boolean, String],
        background: {
            accepted: [false, String],
            value: false
        },
        font: {
            color: "#444",
            decoration: decoration(),
            family: family(),
            size: 16,
            transform: transform(),
            weight: 400
        },
        padding: 5,
        style: {
            accepted: [false, "small", "large"],
            value: false
        },
        value: true
    };

}).call(this);