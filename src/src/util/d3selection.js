// Cross-browser detect for D3 element
(function() {
    var ie;

    ie = require("../client/ie.js");

    module.exports = function(elem) {
        if (ie) {
            return typeof elem === "object" && elem instanceof Array && "size" in elem && "select" in elem;
        } else {
            return elem instanceof d3.selection;
        }
    };

}).call(this);