(function() {
    var color, legible, print;

    color = require('../../../../core/fetch/color.js');

    legible = require('../../../../color/legible.js');

    print = require('../../../../core/console/print.js');

    module.exports = function(vars) {
        var axes,
            axis,
            axisData,
            data,
            i,
            len,
            margin,
            ref,
            style,
            tick,
            ticks,
            timing;
        axes = vars.axes;
        margin = vars.axes.margin.viz;
        data = axes.stacked || !axes.ticks.value ? [] : vars.data.viz;
        timing = data.length * 2 > vars.data.large ? 0 : vars.draw.timing;
        style = function(line, axis) {
            if (axis.indexOf('y') === 0) {
                line
                    .attr('x1', -2)
                    .attr('x2', -8)
                    .attr('y1', function(d) {
                        return d.d3po.y - margin.top;
                    })
                    .attr('y2', function(d) {
                        return d.d3po.y - margin.top;
                    });
            } else {
                line
                    .attr('x1', function(d) {
                        return d.d3po.x - margin.left;
                    })
                    .attr('x2', function(d) {
                        return d.d3po.x - margin.left;
                    })
                    .attr('y1', axes.height + 2)
                    .attr('y2', axes.height + 8);
            }
            return line
                .style('stroke', function(d) {
                    return legible(color(vars, d));
                })
                .style('stroke-width', vars.data.stroke.width)
                .attr('shape-rendering', vars.shape.rendering.value);
        };
        if (vars.dev.value) {
            print.time('creating axis tick groups');
        }
        ticks = vars.group
            .select('g#d3po_graph_plane')
            .selectAll('g.d3po_data_tick')
            .data(data, function(d) {
                var mod;
                mod = axes.discrete ? '_' + d.d3po[axes.discrete] : '';
                return 'tick_' + d[vars.id.value] + '_' + d.d3po.depth + mod;
            });
        ticks
            .enter()
            .append('g')
            .attr('class', 'd3po_data_tick')
            .attr('opacity', 0);
        if (vars.dev.value) {
            print.timeEnd('creating axis tick groups');
        }
        ref = ['x', 'y'];
        for (i = 0, len = ref.length; i < len; i++) {
            axis = ref[i];
            if (vars.dev.value && timing) {
                print.time('creating ' + axis + ' ticks');
            }
            axisData = timing && axis !== axes.discrete ? data : [];
            tick = ticks
                .selectAll('line.d3po_data_' + axis)
                .data(axisData, function(d) {
                    return 'tick_' + d[vars.id.value] + '_' + d.d3po.depth;
                });
            if (vars.dev.value && timing) {
                print.timeEnd('creating ' + axis + ' ticks');
            }
            if (vars.dev.value && timing) {
                print.time('styling ' + axis + ' ticks');
            }
            if (timing > 0) {
                tick
                    .transition()
                    .duration(timing)
                    .call(style, axis);
            } else {
                tick.call(style, axis);
            }
            tick
                .enter()
                .append('line')
                .attr('class', 'd3po_data_' + axis)
                .call(style, axis);
            if (vars.dev.value && timing) {
                print.timeEnd('styling ' + axis + ' ticks');
            }
        }
        if (timing > 0) {
            ticks
                .transition()
                .duration(timing)
                .attr('opacity', 1);
            ticks
                .exit()
                .transition()
                .duration(timing)
                .attr('opacity', 0)
                .remove();
        } else {
            ticks.attr('opacity', 1);
            ticks.exit().remove();
        }
    };
}.call(this));
