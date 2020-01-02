(function() {
    var d3sankey, events, removeTooltip, sankey, uniques;

    d3sankey = require('./sankey.js');

    events = require('../../client/pointer.js');

    removeTooltip = require('../../tooltip/remove.js');

    uniques = require('../../util/uniques.js');

    sankey = function(vars) {
        var d,
            e,
            edges,
            focus,
            i,
            j,
            layout,
            len,
            len1,
            n,
            nodes,
            padding,
            placed,
            returnData,
            size;
        focus = vars.focus.value[0];
        padding = vars.data.stroke.width * 2;
        size = vars.size.value.constructor === Number ? vars.size.value : 20;
        edges = vars.edges.connections(focus, vars.id.value).filter(function(e) {
            return (
                e[vars.edges.source][vars.id.value] !== focus ||
        e[vars.edges.target][vars.id.value] !== focus
            );
        });
        nodes = [];
        placed = [];
        edges = edges.map(function(e) {
            var s, t;
            if (e[vars.edges.target][vars.id.value] === focus) {
                s = {
                    id: 'left_' + e[vars.edges.source][vars.id.value],
                    dupe: 'left',
                    data: e[vars.edges.source],
                    value: e[vars.edges.strength.value]
                };
                t = e[vars.edges.target];
            } else {
                s = e[vars.edges.source];
                t = {
                    id: 'right_' + e[vars.edges.target][vars.id.value],
                    dupe: 'right',
                    data: e[vars.edges.target],
                    value: e[vars.edges.strength.value]
                };
            }
            if (placed.indexOf(s.id) < 0) {
                nodes.push(s);
            }
            if (placed.indexOf(t.id) < 0) {
                nodes.push(t);
            }
            placed.push(s.id);
            placed.push(t.id);
            return {
                source: s,
                target: t,
                value: e[vars.edges.strength.value] || 1
            };
        });
        layout = d3sankey()
            .nodeWidth(size)
            .nodePadding(vars.data.padding.value)
            .size([vars.width.viz - padding * 2, vars.height.viz - padding * 2])
            .nodes(nodes)
            .links(edges)
            .layout(2);
        returnData = [];
        for (i = 0, len = nodes.length; i < len; i++) {
            n = nodes[i];
            d = n.data || n;
            d = {
                id: d[vars.id.value]
            };
            d.d3po = {
                x: n.x + n.dx / 2 + padding,
                y: n.y + n.dy / 2 + padding,
                width: n.dx,
                height: n.dy,
                suffix: n.dupe
            };
            if (d.id !== focus) {
                d[vars.edges.strength.value] = n.value;
            }
            returnData.push(d);
        }
        vars.edges.path = layout.link();
        for (j = 0, len1 = edges.length; j < len1; j++) {
            e = edges[j];
            e.d3po = {
                x: padding,
                y: padding
            };
        }
        vars.mouse.viz = {};
        vars.mouse.viz[events.click] = function(d) {
            var old_focus;
            if (d[vars.id.value] !== vars.focus.value[0]) {
                removeTooltip(vars.type.value);
                old_focus = vars.focus.value[0];
                vars.history.states.push(function() {
                    return vars.self.focus(old_focus).draw();
                });
                return vars.self.focus(d[vars.id.value]).draw();
            }
        };
        return {
            nodes: returnData,
            edges: edges
        };
    };

    sankey.requirements = ['edges', 'focus', 'nodes'];

    sankey.shapes = ['square'];

    module.exports = sankey;
}.call(this));
