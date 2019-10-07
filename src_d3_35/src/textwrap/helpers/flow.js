// Flows the text into the container
(function() {
    var foreign, tspan;

    foreign = require("./foreign.js");

    tspan = require("./tspan.js");

    module.exports = function(vars) {
        if (vars.text.html.value) {
            foreign(vars);
        } else {
            tspan(vars);
        }
    };

}).call(this);