(function() {
    var decoration, family, transform;

    family = require("../../core/methods/font/family.js");

    decoration = require("../../core/methods/font/decoration.js");

    transform = require("../../core/methods/font/transform.js");

    module.exports = {
        accepted: [false, Number, String],
        font: {
            align: "center",
            color: "#444",
            decoration: decoration(),
            family: family(),
            size: 11,
            transform: transform(),
            weight: 400
        },
        link: false,
        padding: 0,
        position: "bottom",
        value: false
    };

}).call(this);