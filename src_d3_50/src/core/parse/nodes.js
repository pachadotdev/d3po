var print = require("../console/print.js");

// Calculates node positions, if needed for network.
module.exports = function(vars) {

    if (vars.type.value === "network") {

        if (vars.dev.value) {
            var timerString = "analyzing node positions";
            print.time(timerString);
        }

        var set = vars.nodes.value.filter(function(n) {
            return typeof n.x === "number" && typeof n.y === "number";
        }).length;

        if (set === vars.nodes.value.length) {
            vars.nodes.positions = true;
        } else {

            var forceLink = d3.forceLink(vars.edges.value);
            var strength = vars.edges.strength.value;
            if (strength) {
                if (typeof strength === "string") {
                    forceLink.strength(function(e) {
                        return e[strength];
                    });
                } else {
                    forceLink.strength(strength);
                }
            }

            var force = d3.forceSimulation(vars.nodes.value)
                .force("center", d3.forceCenter([vars.width.viz / 2, vars.height.viz / 2]))
                .force("links", forceLink);

            var iterations = 50,
                threshold = 0.01;

            for (var i = iterations; i > 0; --i) {
                force.tick();
                if (force.alpha() < threshold) {
                    break;
                }
            }
            force.stop();

            vars.nodes.positions = true;

        }

        if (vars.dev.value) print.timeEnd(timerString);

    }

}