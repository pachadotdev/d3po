(function() {
    var area, closest, fetchValue, graph, nest, sort, stack, threshold;

    closest = require("../../util/closest.js");

    fetchValue = require("../../core/fetch/value.js");

    graph = require("./helpers/graph/draw.js");

    nest = require("./helpers/graph/nest.js");

    sort = require("../../array/sort.js");

    stack = require("./helpers/graph/stack.js");

    threshold = require("../../core/data/threshold.js");

    area = function(vars) {
        var d, data, discrete, domains, i, j, len, len1, opposite, point, ref;
        graph(vars, {
            buffer: vars.axes.opposite,
            zero: true
        });
        domains = vars.x.domain.viz.concat(vars.y.domain.viz);
        if (domains.indexOf(void 0) >= 0) {
            return [];
        }
        data = sort(vars.data.viz, null, null, null, vars);
        discrete = vars[vars.axes.discrete];
        opposite = vars[vars.axes.opposite];
        for (i = 0, len = data.length; i < len; i++) {
            point = data[i];
            if (!point.d3po) {
                point.d3po = {};
            }
            ref = point.values;
            for (j = 0, len1 = ref.length; j < len1; j++) {
                d = ref[j];
                if (!d.d3po) {
                    d.d3po = {};
                }
                d.d3po.x = discrete.scale.viz(fetchValue(vars, d, discrete.value));
                d.d3po.x += vars.axes.margin.viz.left;
                d.d3po.y = opposite.scale.viz(fetchValue(vars, d, opposite.value));
                d.d3po.y += vars.axes.margin.viz.top;
                if (d.d3po.merged instanceof Array) {
                    if (!point.d3po.merged) {
                        point.d3po.merged = [];
                    }
                    point.d3po.merged = point.d3po.merged.concat(d.d3po.merged);
                }
                if (d.d3po.text && !point.d3po.text) {
                    point.d3po.text = d.d3po.text;
                }
            }
        }
        return stack(vars, data);
    };

    area.filter = function(vars, data) {
        return nest(vars, threshold(vars, data, vars[vars.axes.discrete].value));
    };

    area.requirements = ["data", "x", "y"];

    area.setup = function(vars) {
        var axis, size, y;
        if (!vars.axes.discrete) {
            axis = vars.time.value === vars.y.value ? "y" : "x";
            vars.self[axis]({
                scale: "discrete"
            });
        }
        if (!vars[vars.axes.discrete].zerofill.value) {
            vars.self[vars.axes.discrete]({
                zerofill: true
            });
        }
        if (!vars[vars.axes.opposite].stacked.value && vars.type.value === "stacked") {
            vars.self[vars.axes.opposite]({
                stacked: true
            });
        }
        y = vars[vars.axes.opposite];
        size = vars.size;
        if ((!y.value && size.value) || (size.changed && size.previous === y.value)) {
            return vars.self[vars.axes.opposite](size.value);
        } else if ((!size.value && y.value) || (y.changed && y.previous === size.value)) {
            return vars.self.size(y.value);
        }
    };

    area.shapes = ["area"];

    area.threshold = function(vars) {
        return 20 / vars.height.viz;
    };

    area.tooltip = "static";

    module.exports = area;

}).call(this);