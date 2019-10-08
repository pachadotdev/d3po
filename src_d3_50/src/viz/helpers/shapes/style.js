// Fill style for all shapes
(function() {
    var color, ie, value;

    color = require("./color.js");

    ie = require("../../../client/ie.js");

    value = require("../../../core/fetch/value.js");

    module.exports = function(nodes, vars) {
        return nodes.attr("fill", function(d) {
            if (d.d3po && d.d3po.spline) {
                return "none";
            } else {
                return color(d, vars);
            }
        }).style("stroke", function(d) {
            var c;
            if (d.d3po && d.d3po.stroke) {
                return d.d3po.stroke;
            } else {
                c = d.values ? color(d.values[0], vars) : color(d, vars, true);
                return d3.rgb(c).darker(0.6).formatHex();
            }
        }).style("stroke-width", function(d) {
            var v;
            if (ie && vars.types[vars.type.value].zoom) {
                return 0;
            }
            if (d.d3po.shape === "line" && vars.size.value) {
                if (vars.size.value.constructor === Number) {
                    return vars.size.value;
                }
                v = value(vars, d, vars.size.value);
                if (v && v.length) {
                    return d3.max(v);
                }
            }
            return vars.data.stroke.width;
        }).attr("opacity", vars.data.opacity).attr("vector-effect", "non-scaling-stroke");
    };

}).call(this);