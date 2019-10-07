// Returns a random color
(function() {
    var defaultScale;

    defaultScale = require("./scale.js");

    module.exports = function(x, scale) {
        var rand_int;
        rand_int = x || Math.floor(Math.random() * 20);
        scale = scale || defaultScale;
        return scale(rand_int);
    };

}).call(this);