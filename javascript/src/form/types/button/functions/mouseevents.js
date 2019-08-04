(function() {
    module.exports = function(elem, vars, color) {
        var events, ie;
        color = require("./color.js");
        events = require("../../../../client/pointer.js");
        ie = require("../../../../client/ie.js");
        return elem.on(events.over, function(d, i) {
            vars.self.hover(d[vars.id.value]);
            if (ie || !vars.draw.timing) {
                return d3.select(this).style("cursor", "pointer").call(color, vars);
            } else {
                return d3.select(this).style("cursor", "pointer").transition().duration(vars.timing.mouseevents).call(color, vars);
            }
        }).on(events.out, function(d) {
            vars.self.hover(false);
            if (ie || !vars.draw.timing) {
                return d3.select(this).style("cursor", "auto").call(color, vars);
            } else {
                return d3.select(this).style("cursor", "auto").transition().duration(vars.timing.mouseevents).call(color, vars);
            }
        }).on(events.click, function(d) {
            if (vars.focus.value !== false) {
                return vars.self.focus(d[vars.id.value]).draw();
            } else if (vars.focus.callback) {
                return vars.focus.callback(d, vars.self);
            }
        });
    };

}).call(this);