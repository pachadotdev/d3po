(function() {
    var mix, textwrap, validObject;

    mix = require('../../../../../color/mix.js');

    textwrap = require('../../../../../textwrap/textwrap.js');

    validObject = require('../../../../../object/validate.js');

    module.exports = function(vars) {
        var affixes,
            alignMap,
            axis,
            axisData,
            axisGroup,
            axisLabel,
            bg,
            bgStyle,
            d,
            domain,
            domains,
            getFontStyle,
            grid,
            gridData,
            groupEnter,
            j,
            k,
            l,
            label,
            labelData,
            labelStyle,
            len,
            len1,
            len2,
            len3,
            len4,
            line,
            lineData,
            lineFont,
            lineGroup,
            lineRects,
            lineStyle,
            lines,
            linetexts,
            m,
            mirror,
            n,
            opp,
            plane,
            planeTrans,
            position,
            realData,
            rectData,
            rectStyle,
            ref,
            ref1,
            ref2,
            ref3,
            rotated,
            sep,
            style,
            textData,
            textPad,
            textPos,
            tickFont,
            tickPosition,
            tickStyle,
            userLines,
            valid,
            xStyle,
            yStyle;
        domains = vars.x.domain.viz.concat(vars.y.domain.viz);
        if (domains.indexOf(void 0) >= 0) {
            return null;
        }
        bgStyle = {
            width: vars.axes.width,
            height: vars.axes.height,
            fill: vars.axes.background.color,
            stroke: vars.axes.background.stroke.color,
            'stroke-width': vars.axes.background.stroke.width,
            'shape-rendering': vars.axes.background.rendering.value
        };
        alignMap = {
            left: 'start',
            center: 'middle',
            right: 'end'
        };
        axisData = vars.small ? [] : [0];
        tickPosition = function(tick, axis) {
            return tick
                .attr('x1', function(d) {
                    if (axis.indexOf('x') === 0) {
                        return vars.x.scale.viz(d);
                    } else {
                        return 0;
                    }
                })
                .attr('x2', function(d) {
                    if (axis.indexOf('x') === 0) {
                        return vars.x.scale.viz(d);
                    } else {
                        return vars.axes.width;
                    }
                })
                .attr('y1', function(d) {
                    if (axis.indexOf('y') === 0) {
                        return vars.y.scale.viz(d);
                    } else {
                        return 0;
                    }
                })
                .attr('y2', function(d) {
                    if (axis.indexOf('y') === 0) {
                        return vars.y.scale.viz(d);
                    } else {
                        return vars.axes.height;
                    }
                });
        };
        tickStyle = function(tick, axis, grid) {
            var color, log, visibles;
            color = grid ? vars[axis].grid.color : vars[axis].ticks.color;
            log = vars[axis].scale.value === 'log';
            visibles = vars[axis].ticks.visible || [];
            return tick
                .attr('stroke', function(d) {
                    var visible;
                    if (d === 0) {
                        return vars[axis].axis.color;
                    }
                    if (d.constructor === Date) {
                        d = +d;
                    }
                    visible = visibles.indexOf(d) >= 0;
                    if (
                        visible &&
            (!log ||
              Math.abs(d)
                  .toString()
                  .charAt(0) === '1')
                    ) {
                        return color;
                    } else if (grid && vars.axes.background.color !== 'transparent') {
                        return mix(color, vars.axes.background.color, 0.4, 1);
                    } else if (vars.background.value !== 'transparent') {
                        return mix(color, vars.background.value, 0.4, 1);
                    } else {
                        return mix(color, 'white', 0.4, 1);
                    }
                })
                .attr('stroke-width', vars[axis].ticks.width)
                .attr('shape-rendering', vars[axis].ticks.rendering.value);
        };
        getFontStyle = function(axis, val, style) {
            var type;
            type = val === 0 ? 'axis' : 'ticks';
            val = vars[axis][type].font[style];
            if (val && (val.length || typeof val === 'number')) {
                return val;
            } else {
                return vars[axis].ticks.font[style];
            }
        };
        tickFont = function(tick, axis) {
            var log;
            log = vars[axis].scale.value === 'log';
            return tick
                .attr('font-size', function(d) {
                    return getFontStyle(axis, d, 'size') + 'px';
                })
                .attr('stroke', 'none')
                .attr('fill', function(d) {
                    var color;
                    color = getFontStyle(axis, d, 'color');
                    if (
                        !log ||
            Math.abs(d)
                .toString()
                .charAt(0) === '1'
                    ) {
                        return color;
                    } else {
                        return mix(color, vars.background.value, 0.4, 1);
                    }
                })
                .attr('font-family', function(d) {
                    return getFontStyle(axis, d, 'family').value;
                })
                .attr('font-weight', function(d) {
                    return getFontStyle(axis, d, 'weight');
                })
                .style('text-transform', function(d) {
                    return getFontStyle(axis, d, 'transform').value;
                })
                .style('letter-spacing', function(d) {
                    return getFontStyle(axis, d, 'spacing') + 'px';
                });
        };
        lineStyle = function(line, axis) {
            var max, opp;
            max = axis.indexOf('x') === 0 ? 'height' : 'width';
            opp = axis.indexOf('x') === 0 ? 'y' : 'x';
            return line
                .attr(opp + '1', 0)
                .attr(opp + '2', vars.axes[max])
                .attr(axis + '1', function(d) {
                    return d.coords.line;
                })
                .attr(axis + '2', function(d) {
                    return d.coords.line;
                })
                .attr('stroke', function(d) {
                    return d.color || vars[axis].lines.color;
                })
                .attr('stroke-width', vars[axis].lines.width)
                .attr('shape-rendering', vars[axis].lines.rendering.value)
                .attr('stroke-dasharray', vars[axis].lines.dasharray.value);
        };
        lineFont = function(text, axis) {
            var opp;
            opp = axis.indexOf('x') === 0 ? 'y' : 'x';
            return text
                .attr(opp, function(d) {
                    return d.coords.text[opp] + 'px';
                })
                .attr(axis, function(d) {
                    return d.coords.text[axis] + 'px';
                })
                .attr('dy', vars[axis].lines.font.position.value)
                .attr('text-anchor', alignMap[vars[axis].lines.font.align.value])
                .attr('transform', function(d) {
                    return d.transform;
                })
                .attr('font-size', vars[axis].lines.font.size + 'px')
                .attr('fill', function(d) {
                    return d.color || vars[axis].lines.color;
                })
                .attr('font-family', vars[axis].lines.font.family.value)
                .attr('font-weight', vars[axis].lines.font.weight);
        };
        planeTrans =
      'translate(' +
      vars.axes.margin.viz.left +
      ',' +
      vars.axes.margin.viz.top +
      ')';
        plane = vars.group.selectAll('g#d3po_graph_plane').data([0]);
        plane
            .transition()
            .duration(vars.draw.timing)
            .attr('transform', planeTrans);
        plane
            .enter()
            .append('g')
            .attr('id', 'd3po_graph_plane')
            .attr('transform', planeTrans);
        bg = plane.selectAll('rect#d3po_graph_background').data([0]);
        bg.transition()
            .duration(vars.draw.timing)
            .attr(bgStyle);
        bg.enter()
            .append('rect')
            .attr('id', 'd3po_graph_background')
            .attr('x', 0)
            .attr('y', 0)
            .attr(bgStyle);
        mirror = plane.selectAll('path#d3po_graph_mirror').data([0]);
        mirror
            .enter()
            .append('path')
            .attr('id', 'd3po_graph_mirror')
            .attr('fill', '#000')
            .attr('fill-opacity', 0.03)
            .attr('stroke-width', 1)
            .attr('stroke', '#ccc')
            .attr('stroke-dasharray', '10,10')
            .attr('opacity', 0);
        mirror
            .transition()
            .duration(vars.draw.timing)
            .attr('opacity', function() {
                if (vars.axes.mirror.value) {
                    return 1;
                } else {
                    return 0;
                }
            })
            .attr('d', function() {
                var h, w;
                w = bgStyle.width;
                h = bgStyle.height;
                return 'M ' + w + ' ' + h + ' L 0 ' + h + ' L ' + w + ' 0 Z';
            });
        rotated = vars.x.ticks.rotate !== 0;
        xStyle = function(group, axis) {
            var groups, offset;
            offset = axis === 'x' ? vars.axes.height : 0;
            groups = group
                .attr('transform', 'translate(0,' + offset + ')')
                .call(vars[axis].axis.svg.scale(vars[axis].scale.viz))
                .selectAll('g.tick');
            groups.selectAll('line').attr('y2', function(d) {
                var y2;
                if (d.constructor === Date) {
                    d = +d;
                }
                y2 = d3.select(this).attr('y2');
                if (vars[axis].ticks.visible.indexOf(d) >= 0) {
                    return y2;
                } else {
                    return y2 / 2;
                }
            });
            return groups
                .select('text')
                .style(
                    'text-anchor',
                    rotated && axis === 'x' ? 'end' : rotated ? 'start' : 'middle'
                )
                .call(tickFont, axis)
                .each(function(d) {
                    d3.select(this)
                        .attr('dy', '0px')
                        .attr('font-size', function(d) {
                            return getFontStyle(axis, d, 'size') + 'px';
                        });
                    if (d.constructor === Date) {
                        d = +d;
                    }
                    if (
                        !vars[axis].ticks.hidden &&
            vars[axis].ticks.visible.indexOf(d) >= 0
                    ) {
                        return textwrap()
                            .container(d3.select(this))
                            .rotate(vars[axis].ticks.rotate)
                            .align(rotated ? 'end' : 'center')
                            .valign(rotated ? 'middle' : axis === 'x' ? 'top' : 'bottom')
                            .width(vars[axis].ticks.maxWidth + 2)
                            .height(vars[axis].ticks.maxHeight)
                            .padding(0)
                            .x(-vars[axis].ticks.maxWidth / 2)
                            .y(
                                axis === 'x2'
                                    ? -(vars[axis].ticks.maxHeight + vars.labels.padding * 2)
                                    : 0
                            )
                            .draw();
                    }
                });
        };
        yStyle = function(group, axis) {
            var groups, offset;
            offset = axis === 'y2' ? vars.axes.width : 0;
            groups = group
                .attr('transform', 'translate(' + offset + ', 0)')
                .call(vars[axis].axis.svg.scale(vars[axis].scale.viz))
                .selectAll('g.tick');
            groups.selectAll('line').attr('y2', function(d) {
                var y2;
                if (d.constructor === Date) {
                    d = +d;
                }
                y2 = d3.select(this).attr('y2');
                if (vars.x.ticks.visible.indexOf(d) >= 0) {
                    return y2;
                } else {
                    return y2 / 2;
                }
            });
            return groups.select('text').call(tickFont, axis);
        };
        ref = ['x', 'x2', 'y', 'y2'];
        for (j = 0, len = ref.length; j < len; j++) {
            axis = ref[j];
            style = axis.indexOf('x') === 0 ? xStyle : yStyle;
            realData = axisData.length && vars[axis].value ? [0] : [];
            axisGroup = plane
                .selectAll('g#d3po_graph_' + axis + 'ticks')
                .data(realData);
            axisGroup
                .transition()
                .duration(vars.draw.timing)
                .call(style, axis);
            axisGroup
                .selectAll('line')
                .transition()
                .duration(vars.draw.timing)
                .call(tickStyle, axis);
            groupEnter = axisGroup
                .enter()
                .append('g')
                .attr('id', 'd3po_graph_' + axis + 'ticks')
                .call(style, axis);
            groupEnter
                .selectAll('path')
                .attr('fill', 'none')
                .attr('stroke', 'none');
            groupEnter.selectAll('line').call(tickStyle, axis);
            axisGroup
                .exit()
                .transition()
                .duration(vars.data.timing)
                .attr('opacity', 0)
                .remove();
        }
        labelStyle = function(label, axis) {
            return label
                .attr(
                    'x',
                    axis.indexOf('x') === 0
                        ? vars.width.viz / 2
                        : -(vars.axes.height / 2 + vars.axes.margin.viz.top)
                )
                .attr(
                    'y',
                    axis === 'x'
                        ? vars.height.viz -
                vars[axis].label.height / 2 -
                vars[axis].label.padding
                        : axis === 'y2'
                            ? vars.width.viz -
              vars[axis].label.height / 2 -
              vars[axis].label.padding
                            : vars[axis].label.height / 2 + vars[axis].label.padding
                )
                .attr('transform', axis.indexOf('y') === 0 ? 'rotate(-90)' : null)
                .attr('font-family', vars[axis].label.font.family.value)
                .attr('font-weight', vars[axis].label.font.weight)
                .attr('font-size', vars[axis].label.font.size + 'px')
                .attr('fill', vars[axis].label.font.color)
                .style('text-anchor', 'middle')
                .attr('dominant-baseline', 'central')
                .style('text-transform', vars[axis].label.font.transform.value)
                .style('letter-spacing', vars[axis].label.font.spacing + 'px');
        };
        ref1 = ['x', 'y'];
        for (k = 0, len1 = ref1.length; k < len1; k++) {
            axis = ref1[k];
            if (vars[axis].grid.value) {
                if (vars[axis].ticks.value) {
                    gridData = vars[axis].ticks.value;
                } else {
                    gridData = vars[axis].ticks.values;
                }
            } else {
                gridData = [];
                opp = axis === 'x' ? 'y' : 'x';
                if (vars[axis].ticks.values.indexOf(0) >= 0 && vars[opp].axis.value) {
                    gridData = [0];
                }
            }
            if (vars[axis].value === vars.time.value) {
                gridData = gridData.map(function(d) {
                    d += '';
                    if (d.length === 4 && parseInt(d) + '' === d) {
                        d += '/01/01';
                    }
                    return new Date(d).getTime();
                });
            }
            grid = plane.selectAll('g#d3po_graph_' + axis + 'grid').data([0]);
            grid
                .enter()
                .append('g')
                .attr('id', 'd3po_graph_' + axis + 'grid');
            lines = grid.selectAll('line').data(gridData, function(d, i) {
                if (d.constructor === Date) {
                    return d.getTime();
                } else {
                    return d;
                }
            });
            lines
                .transition()
                .duration(vars.draw.timing)
                .call(tickPosition, axis)
                .call(tickStyle, axis, true);
            lines
                .enter()
                .append('line')
                .style('opacity', 0)
                .call(tickPosition, axis)
                .call(tickStyle, axis, true)
                .transition()
                .duration(vars.draw.timing)
                .delay(vars.draw.timing / 2)
                .style('opacity', 1);
            lines
                .exit()
                .transition()
                .duration(vars.draw.timing / 2)
                .style('opacity', 0)
                .remove();
        }
        ref2 = ['x', 'x2', 'y', 'y2'];
        for (l = 0, len2 = ref2.length; l < len2; l++) {
            axis = ref2[l];
            if (vars[axis].value) {
                axisLabel = vars[axis].label.fetch(vars);
                labelData = axisData && axisLabel && !vars.small ? [0] : [];
                affixes = vars.format.affixes.value[vars[axis].value];
                if (axisLabel && !vars[axis].affixes.value && affixes) {
                    sep = vars[axis].affixes.separator.value;
                    if (sep === true) {
                        sep = ['[', ']'];
                    } else if (sep === false) {
                        sep = ['', ''];
                    }
                    axisLabel += ' ' + sep[0] + affixes[0] + ' ' + affixes[1] + sep[1];
                }
            } else {
                axisLabel = '';
                labelData = [];
            }
            label = vars.group
                .selectAll('text#d3po_graph_' + axis + 'label')
                .data(labelData);
            label
                .text(axisLabel)
                .transition()
                .duration(vars.draw.timing)
                .call(labelStyle, axis);
            label
                .enter()
                .append('text')
                .attr('stroke', 'none')
                .attr('id', 'd3po_graph_' + axis + 'label')
                .text(axisLabel)
                .call(labelStyle, axis);
            label
                .exit()
                .transition()
                .duration(vars.data.timing)
                .attr('opacity', 0)
                .remove();
        }
        ref3 = ['x', 'y', 'x2', 'y2'];
        for (m = 0, len3 = ref3.length; m < len3; m++) {
            axis = ref3[m];
            if (vars[axis].value) {
                lineGroup = plane
                    .selectAll('g#d3po_graph_' + axis + '_userlines')
                    .data([0]);
                lineGroup
                    .enter()
                    .append('g')
                    .attr('id', 'd3po_graph_' + axis + '_userlines');
                domain = vars[axis].scale.viz.domain();
                if (axis.indexOf('y') === 0) {
                    domain = domain.slice().reverse();
                }
                textData = [];
                lineData = [];
                userLines = vars[axis].lines.value || [];
                for (n = 0, len4 = userLines.length; n < len4; n++) {
                    line = userLines[n];
                    d = validObject(line) ? line.position : line;
                    if (axis === vars.axes.discrete) {
                        valid = domain.indexOf(d) >= 0;
                    } else {
                        valid = d >= domain[0] && d <= domain[1];
                    }
                    if (valid) {
                        d = !validObject(line)
                            ? {
                                position: d
                            }
                            : line;
                        d.coords = {
                            line: vars[axis].scale.viz(d.position)
                        };
                        lineData.push(d);
                        if (d.text) {
                            d.axis = axis;
                            d.padding = vars[axis].lines.font.padding.value * 0.5;
                            d.align = vars[axis].lines.font.align.value;
                            position = vars[axis].lines.font.position.text;
                            textPad = position === 'middle' ? 0 : d.padding * 2;
                            if (position === 'top') {
                                textPad = -textPad;
                            }
                            if (axis.indexOf('x') === 0) {
                                textPos =
                  d.align === 'left'
                      ? vars.axes.height
                      : d.align === 'center'
                          ? vars.axes.height / 2
                          : 0;
                                if (d.align === 'left') {
                                    textPos -= d.padding * 2;
                                }
                                if (d.align === 'right') {
                                    textPos += d.padding * 2;
                                }
                            } else {
                                textPos =
                  d.align === 'left'
                      ? 0
                      : d.align === 'center'
                          ? vars.axes.width / 2
                          : vars.axes.width;
                                if (d.align === 'right') {
                                    textPos -= d.padding * 2;
                                }
                                if (d.align === 'left') {
                                    textPos += d.padding * 2;
                                }
                            }
                            d.coords.text = {};
                            d.coords.text[axis.indexOf('x') === 0 ? 'y' : 'x'] = textPos;
                            d.coords.text[axis] = vars[axis].scale.viz(d.position) + textPad;
                            d.transform =
                axis.indexOf('x') === 0
                    ? 'rotate(-90,' +
                    d.coords.text.x +
                    ',' +
                    d.coords.text.y +
                    ')'
                    : null;
                            textData.push(d);
                        }
                    }
                }
                lines = lineGroup
                    .selectAll('line.d3po_graph_' + axis + 'line')
                    .data(lineData, function(d) {
                        return d.position;
                    });
                lines
                    .enter()
                    .append('line')
                    .attr('class', 'd3po_graph_' + axis + 'line')
                    .attr('opacity', 0)
                    .call(lineStyle, axis);
                lines
                    .transition()
                    .duration(vars.draw.timing)
                    .attr('opacity', 1)
                    .call(lineStyle, axis);
                lines
                    .exit()
                    .transition()
                    .duration(vars.draw.timing)
                    .attr('opacity', 0)
                    .remove();
                linetexts = lineGroup
                    .selectAll('text.d3po_graph_' + axis + 'line_text')
                    .data(textData, function(d) {
                        return d.position;
                    });
                linetexts
                    .enter()
                    .append('text')
                    .attr('class', 'd3po_graph_' + axis + 'line_text')
                    .attr('id', function(d) {
                        var id;
                        id = d.position + '';
                        id = id.replace('-', 'neg');
                        id = id.replace('.', 'p');
                        return 'd3po_graph_' + axis + 'line_text_' + id;
                    })
                    .attr('opacity', 0)
                    .call(lineFont, axis);
                linetexts
                    .text(function(d) {
                        return d.text;
                    })
                    .transition()
                    .duration(vars.draw.timing)
                    .attr('opacity', 1)
                    .call(lineFont, axis);
                linetexts
                    .exit()
                    .transition()
                    .duration(vars.draw.timing)
                    .attr('opacity', 0)
                    .remove();
                rectStyle = function(rect) {
                    var getText;
                    getText = function(d) {
                        var id;
                        id = d.position + '';
                        id = id.replace('-', 'neg');
                        id = id.replace('.', 'p');
                        return plane
                            .select('text#d3po_graph_' + d.axis + 'line_text_' + id)
                            .node()
                            .getBBox();
                    };
                    return rect
                        .attr('x', function(d) {
                            return getText(d).x - d.padding;
                        })
                        .attr('y', function(d) {
                            return getText(d).y - d.padding;
                        })
                        .attr('transform', function(d) {
                            return d.transform;
                        })
                        .attr('width', function(d) {
                            return getText(d).width + d.padding * 2;
                        })
                        .attr('height', function(d) {
                            return getText(d).height + d.padding * 2;
                        })
                        .attr(
                            'fill',
                            vars.axes.background.color !== 'transparent'
                                ? vars.axes.background.color
                                : 'white'
                        );
                };
                rectData = vars[axis].lines.font.background.value ? textData : [];
                lineRects = lineGroup
                    .selectAll('rect.d3po_graph_' + axis + 'line_rect')
                    .data(rectData, function(d) {
                        return d.position;
                    });
                lineRects
                    .enter()
                    .insert('rect', 'text.d3po_graph_' + axis + 'line_text')
                    .attr('class', 'd3po_graph_' + axis + 'line_rect')
                    .attr('pointer-events', 'none')
                    .attr('opacity', 0)
                    .call(rectStyle);
                lineRects
                    .transition()
                    .delay(vars.draw.timing)
                    .each('end', function(d) {
                        return d3
                            .select(this)
                            .transition()
                            .duration(vars.draw.timing)
                            .attr('opacity', 1)
                            .call(rectStyle);
                    });
                lineRects
                    .exit()
                    .transition()
                    .duration(vars.draw.timing)
                    .attr('opacity', 0)
                    .remove();
            }
        }
    };
}.call(this));
