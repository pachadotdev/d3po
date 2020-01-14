const child = require('../../../util/child.js');
const closest = require('../../../util/closest.js');
const createTooltip = require('../tooltip/create.js');
const events = require('../../../client/pointer.js');
const fetchValue = require('../../../core/fetch/value.js');
const fetchColor = require('../../../core/fetch/color.js');
const fetchText = require('../../../core/fetch/text.js');
const legible = require('../../../color/legible.js');
const print = require('../../../core/console/print.js');
const removeTooltip = require('../../../tooltip/remove.js');
const shapeFill = require('./fill.js');
const stringStrip = require('../../../string/strip.js');
const touch = require('../../../client/touch.js');
const touchEvent = require('../zoom/propagation.js');
const uniqueValues = require('../../../util/uniques.js');
const validObject = require('../../../object/validate.js');
const zoomDirection = require('../zoom/direction.js');

const drawShape = {
  arc: require('./arc.js'),
  area: require('./area.js'),
  check: require('./check.js'),
  coordinates: require('./coordinates.js'),
  line: require('./line.js'),
  radial: require('./radial.js'),
  rect: require('./rect.js'),
  whisker: require('./whisker.js')
};

//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
// Draws the appropriate shape based on the data
//------------------------------------------------------------------------------
module.exports = vars => {
  const data = vars.returned.nodes || [];
  const edges = vars.returned.edges || [];

  vars.draw.timing =
    data.length < vars.data.large && edges.length < vars.edges.large
      ? vars.timing.transitions
      : 0;

  //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // Match vars.shape types to their respective d3po.shape functions. For
  // example, both "square", and "circle" shapes use "rect" as their drawing
  // class.
  //----------------------------------------------------------------------------
  const shapeLookup = {
    arc: 'arc',
    area: 'area',
    check: 'check',
    circle: 'rect',
    coordinates: 'coordinates',
    donut: 'donut',
    line: 'line',
    radial: 'radial',
    rect: 'rect',
    square: 'rect',
    whisker: 'whisker'
  };

  //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // Split the data by each shape type in the data.
  //----------------------------------------------------------------------------
  const shapes = {};
  data.forEach(d => {
    let s = d.d3po && d.d3po.shape ? d.d3po.shape : vars.shape.value;
    if (s in shapeLookup) {
      if (d.d3po) {
        d.d3po.shape = s;
      }
      s = shapeLookup[s];
      if (!shapes[s]) {
        shapes[s] = [];
      }
      shapes[s].push(d);
    }
  });

  //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // Resets the "id" of each data point to use with matching.
  //----------------------------------------------------------------------------
  function id(d) {
    if (!d.d3po.id) {
      d.d3po.id = '';
      for (let i = 0; i <= vars.depth.value; i++) {
        d.d3po.id += fetchValue(vars, d, vars.id.nesting[i]) + '_';
      }

      d.d3po.id += shape;

      ['x', 'y', 'x2', 'y2'].forEach(axis => {
        if (vars[axis].scale.value == 'discrete') {
          let val = fetchValue(vars, d, vars[axis].value);
          if (val.constructor === Date) {
            val = val.getTime();
          }
          d.d3po.id += '_' + val;
        }
      });

      if (d.d3po.suffix) {
        d.d3po.id += '_' + d.d3po.suffix;
      }

      d.d3po.id = stringStrip(d.d3po.id);
    }

    return d;
  }

  //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // Transforms the positions and scale of each group.
  //----------------------------------------------------------------------------
  function transform(g, grow) {
    const scales = vars.types[vars.type.value].scale;
    let scale = 1;
    if (scales) {
      if (validObject[scales] && vars.shape.value in scales) {
        scale = scales[vars.shape.value];
      } else if (typeof scales == 'function') {
        scale = scales(vars, vars.shape.value);
      } else if (typeof scales == 'number') {
        scale = scales;
      }
    }

    scale = grow ? scale : 1;
    g.attr('transform', d => {
      if (['line', 'area', 'coordinates'].indexOf(shape) < 0) {
        const x = d.d3po.x || 0;
        const y = d.d3po.y || 0;
        return 'translate(' + x + ',' + y + ')scale(' + scale + ')';
      } else {
        return 'scale(' + scale + ')';
      }
    });
  }

  //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // Sets the class name for a group
  //----------------------------------------------------------------------------
  function className(g) {
    g.attr('id', d => 'd3po_group_' + d.d3po.id).attr('class', d => {
      const c = vars.class.value
        ? ' ' + fetchValue(vars, d, vars.class.value)
        : '';
      return 'd3po_' + shape + c;
    });
  }

  //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // Remove old groups
  //----------------------------------------------------------------------------
  for (const s in shapeLookup) {
    if (!(shapeLookup[s] in shapes) || d3.keys(shapes).length === 0) {
      const oldShapes = vars.g.data.selectAll('g.d3po_' + shapeLookup[s]);
      if (vars.draw.timing) {
        oldShapes
          .transition()
          .duration(vars.draw.timing)
          .attr('opacity', 0)
          .remove();
      } else {
        oldShapes.remove();
      }
    }
  }

  //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // Create groups by shape, apply data, and call specific shape drawing class.
  //----------------------------------------------------------------------------
  for (var shape in shapes) {
    //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    // Bind Data to Groups
    //--------------------------------------------------------------------------
    const selection = vars.g.data
      .selectAll('g.d3po_' + shape)
      .data(shapes[shape], d => {
        if (!d.d3po) {
          d.d3po = {};
        }

        if (shape === 'coordinates') {
          d.d3po.id = d.id;
          return d.id;
        }

        if (!d.d3po.id) {
          if (d.values) {
            d.values.forEach(v => {
              v = id(v);
              v.d3po.shape = 'circle';
            });
            d.d3po.id = d.key;
          } else {
            d = id(d);
          }
        }

        return d.d3po ? d.d3po.id : false;
      });

    //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    // Groups Exit
    //--------------------------------------------------------------------------
    let exit;
    if (vars.draw.timing) {
      exit = selection
        .exit()
        .transition()
        .duration(vars.draw.timing)
        .attr('opacity', 0)
        .remove();
    } else {
      exit = selection.exit().remove();
    }

    //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    // Existing Groups Update
    //--------------------------------------------------------------------------
    if (vars.draw.timing) {
      selection
        .transition()
        .duration(vars.draw.timing)
        .call(transform)
        .call(className);
    } else {
      selection.call(transform).call(className);
    }

    //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    // Groups Enter
    //--------------------------------------------------------------------------
    const opacity = vars.draw.timing ? 0 : 1;
    const enter = selection
      .enter()
      .append('g')
      .attr('opacity', opacity)
      .call(transform)
      .call(className);

    if (vars.draw.timing) {
      enter
        .transition()
        .duration(vars.draw.timing)
        .attr('opacity', 1);
    }

    //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    // All Groups Sort Order
    //--------------------------------------------------------------------------
    selection.order();

    //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    // Draw appropriate graphics inside of each group
    //--------------------------------------------------------------------------
    if (vars.dev.value) {
      print.time('drawing "' + shape + '" shapes');
    }
    drawShape[shape](vars, selection, enter, exit, transform);
    if (vars.dev.value) {
      print.timeEnd('drawing "' + shape + '" shapes');
    }

    //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    // Check for active and temp fills for rects
    //--------------------------------------------------------------------------
    if (['rect'].indexOf(shape) >= 0 && vars.types[vars.type.value].fill) {
      if (vars.dev.value) {
        print.time('filling "' + shape + '" shapes');
      }
      shapeFill(vars, selection, enter, exit, transform);
      if (vars.dev.value) {
        print.timeEnd('filling "' + shape + '" shapes');
      }
    }
  }

  //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // Function to Update Edges
  //----------------------------------------------------------------------------
  function edge_update(d) {
    if (d && vars.g.edges.selectAll('g').size() > 0) {
      vars.g.edge_hover.selectAll('*').remove();

      vars.g.edges.selectAll('g').each(function(l) {
        const id = d[vars.id.value];
        const source = l[vars.edges.source][vars.id.value];
        const target = l[vars.edges.target][vars.id.value];

        if (
          source == id ||
          source == 'left_' + id ||
          source == 'right_' + id ||
          target == id ||
          target == 'left_' + id ||
          target == 'right_' + id
        ) {
          const elem = vars.g.edge_hover
            .node()
            .appendChild(this.cloneNode(true));
          d3.select(elem)
            .datum(l)
            .attr('opacity', 1)
            .selectAll('line, path')
            .datum(l);
        }
      });

      const marker = vars.edges.arrows.value;

      vars.g.edge_hover
        .attr('opacity', 0)
        .selectAll('line, path')
        .style('stroke', vars.color.primary)
        .style('stroke-width', function(d) {
          if (vars.edges.path && d.dy) {
            return Math.max(1, d.dy);
          }
          return vars.edges.size.value
            ? d3.select(this).style('stroke-width')
            : vars.data.stroke.width * 2;
        })
        .attr('marker-start', e => {
          const direction = vars.edges.arrows.direction.value;

          let d;
          if ('bucket' in e.d3po) {
            d = '_' + e.d3po.bucket;
          } else {
            d = '';
          }

          return direction == 'source' && marker
            ? 'url(#d3po_edge_marker_highlight' + d + ')'
            : 'none';
        })
        .attr('marker-end', e => {
          const direction = vars.edges.arrows.direction.value;

          let d;
          if ('bucket' in e.d3po) {
            d = '_' + e.d3po.bucket;
          } else {
            d = '';
          }

          return direction == 'target' && marker
            ? 'url(#d3po_edge_marker_highlight' + d + ')'
            : 'none';
        });

      vars.g.edge_hover.selectAll('text').style('fill', vars.color.primary);

      if (vars.draw.timing) {
        vars.g.edge_hover
          .transition()
          .duration(vars.timing.mouseevents)
          .attr('opacity', 1);

        vars.g.edges
          .transition()
          .duration(vars.timing.mouseevents)
          .attr('opacity', 0.5);
      } else {
        vars.g.edge_hover.attr('opacity', 1);
      }
    } else {
      if (vars.draw.timing) {
        vars.g.edge_hover
          .transition()
          .duration(vars.timing.mouseevents)
          .attr('opacity', 0)
          .transition()
          .selectAll('*')
          .remove();

        vars.g.edges
          .transition()
          .duration(vars.timing.mouseevents)
          .attr('opacity', 1);
      } else {
        vars.g.edge_hover.selectAll('*').remove();
      }
    }
  }

  edge_update();

  if (vars.tooltip.value) {
    vars.g.data
      .selectAll('g')
      .on(events.over, function(d) {
        if (touch) {
          touchEvent(vars, d3.event);
        }

        if (
          !d3.event.buttons &&
          vars.mouse.value &&
          vars.mouse.over.value &&
          !vars.draw.frozen &&
          (!d.d3po || !d.d3po.static)
        ) {
          let defaultClick = typeof vars.mouse.over.value !== 'function';
          if (typeof vars.mouse.over.value === 'function') {
            defaultClick = vars.mouse.over.value(d, vars.self);
          }
          if (defaultClick) {
            const zoomDir = zoomDirection(d.d3po_data || d, vars);
            const pointer =
              typeof vars.mouse.viz === 'function' ||
              typeof vars.mouse.viz[events.click] === 'function' ||
              (vars.zoom.value &&
                (vars.types[vars.type.value].zoom ||
                  (d.d3po.threshold && d.d3po.merged) ||
                  zoomDir === 1 ||
                  (zoomDir === -1 &&
                    vars.history.states.length &&
                    !vars.tooltip.value.long)));

            d3.select(this)
              .style('cursor', pointer ? 'pointer' : 'auto')
              .transition()
              .duration(vars.timing.mouseevents)
              .call(transform, true);

            d3.select(this)
              .selectAll('.d3po_data')
              .transition()
              .duration(vars.timing.mouseevents)
              .attr('opacity', 1);

            vars.covered = false;

            if (d.values && vars.axes.discrete) {
              const index = vars.axes.discrete === 'x' ? 0 : 1;
              const mouse = d3.mouse(vars.container.value.node())[index];
              const positions = uniqueValues(
                d.values,
                x => x.d3po[vars.axes.discrete]
              );
              const match = closest(positions, mouse);

              d.d3po_data = d.values[positions.indexOf(match)];
              d.d3po = d.values[positions.indexOf(match)].d3po;
            }

            const tooltip_data = d.d3po_data ? d.d3po_data : d;

            createTooltip({
              vars: vars,
              data: tooltip_data
            });

            if (typeof vars.mouse.viz == 'function') {
              vars.mouse.viz(d.d3po_data || d, vars);
            } else if (vars.mouse.viz[events.over]) {
              vars.mouse.viz[events.over](d.d3po_data || d, vars);
            }

            edge_update(d);
          }
        } else {
          removeTooltip(vars.type.value);
        }
      })
      .on(events.move, function(d) {
        if (touch) {
          touchEvent(vars, d3.event);
        }

        if (
          !d3.event.buttons &&
          vars.mouse.value &&
          vars.mouse.move.value &&
          !vars.draw.frozen &&
          (!d.d3po || !d.d3po.static)
        ) {
          let defaultClick = typeof vars.mouse.move.value !== 'function';
          if (typeof vars.mouse.move.value === 'function') {
            defaultClick = vars.mouse.move.value(d, vars.self);
          }
          if (defaultClick) {
            const zoomDir = zoomDirection(d.d3po_data || d, vars);
            const pointer =
              typeof vars.mouse.viz === 'function' ||
              typeof vars.mouse.viz[events.click] === 'function' ||
              (vars.zoom.value &&
                (vars.types[vars.type.value].zoom ||
                  (d.d3po.threshold && d.d3po.merged) ||
                  zoomDir === 1 ||
                  (zoomDir === -1 &&
                    vars.history.states.length &&
                    !vars.tooltip.value.long)));

            d3.select(this).style('cursor', pointer ? 'pointer' : 'auto');

            if (d.values && vars.axes.discrete) {
              const index = vars.axes.discrete === 'x' ? 0 : 1;
              const mouse = d3.mouse(vars.container.value.node())[index];
              const positions = uniqueValues(
                d.values,
                x => x.d3po[vars.axes.discrete]
              );
              const match = closest(positions, mouse);

              d.d3po_data = d.values[positions.indexOf(match)];
              d.d3po = d.values[positions.indexOf(match)].d3po;
            }

            const tooltip_data = d.d3po_data ? d.d3po_data : d;
            createTooltip({
              vars: vars,
              data: tooltip_data
            });

            if (typeof vars.mouse.viz == 'function') {
              vars.mouse.viz(d.d3po_data || d, vars);
            } else if (vars.mouse.viz[events.move]) {
              vars.mouse.viz[events.move](d.d3po_data || d, vars);
            }
          }
        } else {
          removeTooltip(vars.type.value);
        }
      })
      .on(events.out, function(d) {
        if (touch) {
          touchEvent(vars, d3.event);
        }

        if (!d3.event.buttons && vars.mouse.value && vars.mouse.out.value) {
          let defaultClick = typeof vars.mouse.out.value !== 'function';
          if (typeof vars.mouse.out.value === 'function') {
            defaultClick = vars.mouse.out.value(d, vars.self);
          }
          if (defaultClick) {
            const childElement = child(this, d3.event.toElement);

            if (
              !childElement &&
              !vars.draw.frozen &&
              (!d.d3po || !d.d3po.static)
            ) {
              d3.select(this)
                .transition()
                .duration(vars.timing.mouseevents)
                .call(transform);

              d3.select(this)
                .selectAll('.d3po_data')
                .transition()
                .duration(vars.timing.mouseevents)
                .attr('opacity', vars.data.opacity);

              if (!vars.covered) {
                removeTooltip(vars.type.value);
              }

              if (typeof vars.mouse.viz == 'function') {
                vars.mouse.viz(d.d3po_data || d, vars);
              } else if (vars.mouse.viz[events.out]) {
                vars.mouse.viz[events.out](d.d3po_data || d, vars);
              }

              edge_update();
            }
          }
        } else {
          removeTooltip(vars.type.value);
        }
      });
  } else {
    const mouseEvent = () => {
      touchEvent(vars, d3.event);
    };

    vars.g.data
      .selectAll('g')
      .on(events.over, mouseEvent)
      .on(events.move, mouseEvent)
      .on(events.out, mouseEvent);
  }

  d3.select(window).on('scroll.d3po', () => {
    removeTooltip(vars.type.value);
  });

  vars.g.data.selectAll('g').on(events.click, function(d) {
    if (
      !(vars.mouse.viz && vars.mouse.viz.click === false) &&
      vars.mouse.value &&
      vars.mouse.click.value &&
      !d3.event.defaultPrevented &&
      !vars.draw.frozen &&
      (!d.d3po || !d.d3po.static)
    ) {
      let defaultClick = typeof vars.mouse.click.value !== 'function';
      if (typeof vars.mouse.click.value === 'function') {
        defaultClick = vars.mouse.click.value(d, vars.self);
      }
      if (defaultClick) {
        if (d.values && vars.axes.discrete) {
          const index = vars.axes.discrete === 'x' ? 0 : 1;
          const mouse = d3.mouse(vars.container.value.node())[index];
          const positions = uniqueValues(
            d.values,
            x => x.d3po[vars.axes.discrete]
          );
          const match = closest(positions, mouse);

          d.d3po_data = d.values[positions.indexOf(match)];
          d.d3po = d.values[positions.indexOf(match)].d3po;
        }

        if (typeof vars.mouse.viz == 'function') {
          vars.mouse.viz(d.d3po_data || d, vars);
        } else if (vars.mouse.viz[events.out]) {
          vars.mouse.viz[events.out](d.d3po_data || d, vars);
        } else if (vars.mouse.viz[events.click]) {
          vars.mouse.viz[events.click](d.d3po_data || d, vars);
        }

        const depth_delta = zoomDirection(d.d3po_data || d, vars);
        const previous = vars.id.solo.value;
        const title = fetchText(vars, d)[0];
        const color = legible(fetchColor(vars, d));
        const prev_sub = vars.title.sub.value || false;
        const prev_color = vars.title.sub.font.color;
        const prev_total = vars.title.total.font.color;

        if (d.d3po.threshold && d.d3po.merged && vars.zoom.value) {
          vars.history.states.push(() => {
            vars.self
              .id({
                solo: previous
              })
              .title({
                sub: {
                  font: {
                    color: prev_color
                  },
                  value: prev_sub
                },
                total: {
                  font: {
                    color: prev_total
                  }
                }
              })
              .draw();
          });

          vars.self
            .id({
              solo: previous.concat(
                uniqueValues(d.d3po.merged, vars.id.value, fetchValue, vars)
              )
            })
            .title({
              sub: {
                font: {
                  color: color
                },
                value: title
              },
              total: {
                font: {
                  color: color
                }
              }
            })
            .draw();
        } else if (depth_delta === 1 && vars.zoom.value) {
          const id = fetchValue(vars, d.d3po_data || d, vars.id.value);

          vars.history.states.push(() => {
            vars.self
              .depth(vars.depth.value - 1)
              .id({
                solo: previous
              })
              .title({
                sub: {
                  font: {
                    color: prev_color
                  },
                  value: prev_sub
                },
                total: {
                  font: {
                    color: prev_total
                  }
                }
              })
              .draw();
          });

          vars.self
            .depth(vars.depth.value + 1)
            .id({
              solo: previous.concat(id)
            })
            .title({
              sub: {
                font: {
                  color: color
                },
                value: title
              },
              total: {
                font: {
                  color: color
                }
              }
            })
            .draw();
        } else if (
          depth_delta === -1 &&
          vars.zoom.value &&
          vars.history.states.length &&
          !vars.tooltip.value.long
        ) {
          vars.history.back();
        } else if (vars.types[vars.type.value].zoom && vars.zoom.value) {
          edge_update();

          d3.select(this)
            .transition()
            .duration(vars.timing.mouseevents)
            .call(transform);

          d3.select(this)
            .selectAll('.d3po_data')
            .transition()
            .duration(vars.timing.mouseevents)
            .attr('opacity', vars.data.opacity);

          removeTooltip(vars.type.value);
          vars.draw.update = false;

          if (!d || d[vars.id.value] == vars.focus.value[0]) {
            vars.self.focus(false).draw();
          } else {
            vars.self.focus(d[vars.id.value]).draw();
          }
        } else if (
          vars.types[vars.type.value].requirements.indexOf('focus') < 0
        ) {
          edge_update();

          const tooltip_data = d.d3po_data ? d.d3po_data : d;

          createTooltip({
            vars: vars,
            data: tooltip_data
          });
        }
      }
    }
  });
};
