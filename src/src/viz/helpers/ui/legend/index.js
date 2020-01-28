const arraySort = require('../../../../array/sort');
const buckets = require('../../../../util/buckets');
const copy = require('../../../../util/copy');
const createTooltip = require('../../tooltip/create');
const dataNest = require('../../../../core/data/nest');
const events = require('../../../../client/pointer');
const fetchValue = require('../../../../core/fetch/value');
const fetchColor = require('../../../../core/fetch/color');
const fetchText = require('../../../../core/fetch/text');
const print = require('../../../../core/console/print');
const removeTooltip = require('../../../../tooltip/remove');
const uniqueValues = require('../../../../util/uniques');
const scroll = require('../../../../client/scroll');
const styleRect = require('./styleRect');

//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
// Creates color key
//------------------------------------------------------------------------------
module.exports = vars => {
  let key_display = true;
  let square_size = 0;

  if (
    !vars.error.internal &&
    vars.color.value &&
    !vars.small &&
    vars.legend.value
  ) {
    if (!vars.color.valueScale) {
      if (vars.dev.value) {
        print.time('grouping data by colors');
      }

      let data;
      if (
        vars.nodes.value &&
        vars.types[vars.type.value].requirements.indexOf('nodes') >= 0
      ) {
        data = copy(vars.nodes.restriced || vars.nodes.value);
        if (vars.data.viz.length) {
          for (var i = 0; i < data.length; i++) {
            const appData = vars.data.viz.filter(
              a => a[vars.id.value] === data[i][vars.id.value]
            );
            if (appData.length) {
              data[i] = appData[0];
            }
          }
        }
      } else {
        data = vars.data.viz;
      }

      if (data.length && 'key' in data[0] && 'values' in data[0]) {
        data = d3.merge(data.map(d => d.values));
      }

      const colorFunction = d => fetchColor(vars, d, colorDepth);
      var colorDepth = 0;
      let colorKey = vars.id.value;

      const colorIndex = vars.id.nesting.indexOf(vars.color.value);
      if (colorIndex >= 0) {
        colorDepth = colorIndex;
        colorKey = vars.id.nesting[colorIndex];
      } else {
        for (let n = 0; n <= vars.depth.value; n++) {
          colorDepth = n;
          colorKey = vars.id.nesting[n];

          const uniqueIDs = uniqueValues(data, d =>
            fetchValue(vars, d, colorKey)
          );
          const uniqueColors = uniqueValues(data, colorFunction);

          if (
            uniqueIDs.length >= uniqueColors.length &&
            uniqueColors.length > 1
          ) {
            break;
          }
        }
      }

      const legendNesting = [vars.color.value];
      // if (vars.icon.value && vars.legend.icons.value) legendNesting.push(vars.icon.value);
      var colors = dataNest(vars, data, legendNesting, false);

      if (vars.dev.value) {
        print.timeEnd('grouping data by color');
      }

      const available_width = vars.width.value;

      square_size = vars.legend.size;

      var key_width =
        square_size * colors.length + vars.ui.padding * (colors.length + 1);

      if (square_size instanceof Array) {
        if (vars.dev.value) {
          print.time('calculating legend size');
        }

        for (i = square_size[1]; i >= square_size[0]; i--) {
          key_width = i * colors.length + vars.ui.padding * (colors.length + 1);
          if (available_width >= key_width) {
            square_size = i;
            break;
          }
        }

        if (vars.dev.value) {
          print.timeEnd('calculating legend size');
        }
      } else if (typeof square_size != 'number' && square_size !== false) {
        square_size = 30;
      }

      if (available_width < key_width || colors.length == 1) {
        key_display = false;
      } else {
        key_width -= vars.ui.padding * 2;

        if (vars.dev.value) {
          print.time('sorting legend');
        }

        if (typeof vars.legend.order.value === 'function') {
          colors = vars.legend.order.value(colors);
        } else {
          let order = vars[vars.legend.order.value].value;

          let sort_color = vars.color.value;
          if (!order) {
            order = vars[vars.color.value].value;
          } else if (vars.legend.order.value !== 'color') {
            sort_color = [];
          }

          arraySort(
            colors,
            order,
            vars.legend.order.sort.value,
            sort_color,
            vars,
            colorDepth
          );
        }

        if (vars.dev.value) {
          print.timeEnd('sorting legend');
        }

        if (vars.dev.value) {
          print.time('drawing legend');
        }

        var start_x;

        if (vars.legend.align == 'start') {
          start_x = vars.ui.padding;
        } else if (vars.legend.align == 'end') {
          start_x = available_width - vars.ui.padding - key_width;
        } else {
          start_x = available_width / 2 - key_width / 2;
        }

        vars.g.legend
          .selectAll('g.d3po_scale')
          .transition()
          .duration(vars.draw.timing)
          .attr('opacity', 0)
          .remove();

        function position(group) {
          group.attr('transform', (g, i) => {
            const x = start_x + i * (vars.ui.padding + square_size);
            return 'translate(' + x + ',' + vars.ui.padding + ')';
          });
        }

        const colorInt = {};
        const keys = vars.g.legend.selectAll('g.d3po_color').data(colors, d => {
          const c = fetchColor(vars, d, colorKey);
          if (!(c in colorInt)) {
            colorInt[c] = -1;
          }
          colorInt[c]++;
          return colorInt[c] + '_' + c;
        });

        keys
          .enter()
          .append('g')
          .attr('class', 'd3po_color')
          .attr('opacity', 0)
          .call(position)
          .append('rect')
          .attr('class', 'd3po_color')
          .attr('stroke', 'none')
          .call(styleRect, square_size, vars, colorKey, colorDepth);

        keys
          .order()
          .transition()
          .duration(vars.draw.timing)
          .call(position)
          .attr('opacity', 1)
          .selectAll('rect.d3po_color')
          .call(styleRect, square_size, vars, colorKey, colorDepth);

        keys
          .exit()
          .transition()
          .duration(vars.draw.timing)
          .attr('opacity', 0)
          .remove();

        if (vars.legend.tooltip.value) {
          keys
            .on(events.over, function(d) {
              d3.select(this).style('cursor', 'pointer');

              const bounds = this.getBoundingClientRect();
              const x = bounds.left + square_size / 2 + scroll.x();
              const y = bounds.top + square_size / 2 + scroll.y() + 5;
              const id = fetchValue(vars, d, colorKey);
              const idIndex = vars.id.nesting.indexOf(colorKey);

              let title;
              if (vars.legend.title.value) {
                title = fetchValue(
                  vars,
                  d,
                  vars.legend.title.value,
                  colorDepth
                );
              } else {
                title =
                  idIndex >= 0
                    ? fetchText(vars, d, idIndex)[0]
                    : vars.format.value(
                      fetchValue(vars, d, vars.color.value, colorKey),
                      {
                        key: vars.color.value,
                        vars: vars,
                        data: d
                      }
                    );
              }

              let html;
              let js;
              if (vars.legend.filters.value && !(id instanceof Array)) {
                html = '<div style=\'text-align:center;\'>';
                const loc = vars.format.locale.value;
                html +=
                  '<div class=\'mute\'>' +
                  vars.format.value(loc.method.mute) +
                  '</div>';
                html +=
                  '<div class=\'solo\'>' +
                  vars.format.value(loc.method.solo) +
                  '</div>';
                html += '</div>';
                js = tooltip => {
                  const style = {
                    border: '1px solid #ccc',
                    display: 'inline-block',
                    margin: '1px 2px',
                    padding: '3px 5px'
                  };
                  tooltip
                    .select('.mute')
                    .style(style)
                    .on(events.over, function() {
                      d3.select(this).style('cursor', 'pointer');
                    })
                    .on(events.click, () => {
                      const mute = vars.id.mute.value;
                      vars.history.states.push(() => {
                        vars.self
                          .id({
                            mute: mute
                          })
                          .draw();
                      });
                      vars.self
                        .id({
                          mute: id
                        })
                        .draw();
                    });
                  tooltip
                    .select('.solo')
                    .style(style)
                    .on(events.over, function() {
                      d3.select(this).style('cursor', 'pointer');
                    })
                    .on(events.click, () => {
                      const solo = vars.id.solo.value;
                      vars.history.states.push(() => {
                        vars.self
                          .id({
                            solo: solo
                          })
                          .draw();
                      });
                      vars.self
                        .id({
                          solo: id
                        })
                        .draw();
                    });
                };
              }

              createTooltip({
                data: d,
                html: html,
                js: js,
                depth: colorDepth,
                footer: false,
                vars: vars,
                x: x,
                y: y,
                mouseevents: this,
                title: title,
                titleOnly: !vars.legend.data.value,
                offset: square_size * 0.4
              });
            })
            .on(events.out, () => {
              removeTooltip(vars.type.value);
            });
        }

        if (vars.dev.value) {
          print.timeEnd('drawing legend');
        }
      }
    } else if (vars.color.valueScale) {
      if (vars.dev.value) {
        print.time('drawing color scale');
      }

      vars.g.legend
        .selectAll('g.d3po_color')
        .transition()
        .duration(vars.draw.timing)
        .attr('opacity', 0)
        .remove();

      let values = vars.color.valueScale.domain();
      colors = vars.color.valueScale.range();

      if (values.length <= 2) {
        values = buckets(values, 6);
      }

      const scale = vars.g.legend.selectAll('g.d3po_scale').data(['scale']);

      scale
        .enter()
        .append('g')
        .attr('class', 'd3po_scale')
        .attr('opacity', 0);

      const heatmapId = vars.container.id + '_legend_heatmap';

      const heatmap = scale.selectAll('#' + heatmapId).data(['heatmap']);

      heatmap
        .enter()
        .append('linearGradient')
        .attr('id', heatmapId)
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '100%')
        .attr('y2', '0%')
        .attr('spreadMethod', 'pad');

      const stops = heatmap.selectAll('stop').data(d3.range(0, colors.length));

      stops
        .enter()
        .append('stop')
        .attr('stop-opacity', 1);

      stops
        .attr('offset', i => Math.round((i / (colors.length - 1)) * 100) + '%')
        .attr('stop-color', i => colors[i]);

      stops.exit().remove();

      const gradient = scale.selectAll('rect#gradient').data(['gradient']);

      gradient
        .enter()
        .append('rect')
        .attr('id', 'gradient')
        .attr('x', () => {
          if (vars.legend.align == 'middle') {
            return vars.width.value / 2;
          } else if (vars.legend.align == 'end') {
            return vars.width.value;
          } else {
            return 0;
          }
        })
        .attr('y', vars.ui.padding)
        .attr('width', 0)
        .attr('height', vars.legend.gradient.height)
        .attr('stroke', vars.legend.font.color)
        .attr('stroke-width', 1)
        .style('fill', 'url(#' + heatmapId + ')');

      const text = scale
        .selectAll('text.d3po_tick')
        .data(d3.range(0, values.length));

      text
        .enter()
        .append('text')
        .attr('class', 'd3po_tick')
        .attr('stroke', 'none')
        .attr('x', () => {
          if (vars.legend.align == 'middle') {
            return vars.width.value / 2;
          } else if (vars.legend.align == 'end') {
            return vars.width.value;
          } else {
            return 0;
          }
        })
        .attr('y', function() {
          return (
            this.getBBox().height +
            vars.legend.gradient.height +
            vars.ui.padding * 2
          );
        });

      let label_width = 0;

      text
        .order()
        .attr('font-weight', vars.legend.font.weight)
        .attr('font-family', vars.legend.font.family.value)
        .attr('font-size', vars.legend.font.size + 'px')
        .style('text-anchor', vars.legend.font.align)
        .attr('fill', vars.legend.font.color)
        .text(d =>
          vars.format.value(values[d], {
            key: vars.color.value,
            vars: vars
          })
        )
        .attr('y', function() {
          return (
            this.getBBox().height +
            vars.legend.gradient.height +
            vars.ui.padding * 2
          );
        })
        .each(function() {
          const w = Math.ceil(this.getBBox().width);
          if (w > label_width) {
            label_width = w;
          }
        });

      label_width += vars.labels.padding * 2;

      key_width = label_width * (values.length - 1);

      if (key_width + label_width < vars.width.value) {
        if (key_width + label_width < vars.width.value / 2) {
          key_width = vars.width.value / 2;
          label_width = key_width / values.length;
          key_width -= label_width;
        }

        if (vars.legend.align == 'start') {
          start_x = vars.ui.padding;
        } else if (vars.legend.align == 'end') {
          start_x = vars.width.value - vars.ui.padding - key_width;
        } else {
          start_x = vars.width.value / 2 - key_width / 2;
        }

        text
          .transition()
          .duration(vars.draw.timing)
          .attr('x', d => start_x + label_width * d);

        text
          .exit()
          .transition()
          .duration(vars.draw.timing)
          .attr('opacity', 0)
          .remove();

        const ticks = scale
          .selectAll('rect.d3po_tick')
          .data(d3.range(0, values.length));

        ticks
          .enter()
          .append('rect')
          .attr('class', 'd3po_tick')
          .attr('x', () => {
            if (vars.legend.align == 'middle') {
              return vars.width.value / 2;
            } else if (vars.legend.align == 'end') {
              return vars.width.value;
            } else {
              return 0;
            }
          })
          .attr('y', vars.ui.padding)
          .attr('width', 0)
          .attr('height', vars.ui.padding + vars.legend.gradient.height)
          .attr('fill', vars.legend.font.color);

        ticks
          .transition()
          .duration(vars.draw.timing)
          .attr('x', d => {
            const mod = d === 0 ? 1 : 0;
            return start_x + label_width * d - mod;
          })
          .attr('y', vars.ui.padding)
          .attr('width', 1)
          .attr('height', vars.ui.padding + vars.legend.gradient.height)
          .attr('fill', vars.legend.font.color);

        ticks
          .exit()
          .transition()
          .duration(vars.draw.timing)
          .attr('width', 0)
          .remove();

        gradient
          .transition()
          .duration(vars.draw.timing)
          .attr('x', () => {
            if (vars.legend.align == 'middle') {
              return vars.width.value / 2 - key_width / 2;
            } else if (vars.legend.align == 'end') {
              return vars.width.value - key_width - vars.ui.padding;
            } else {
              return vars.ui.padding;
            }
          })
          .attr('y', vars.ui.padding)
          .attr('width', key_width)
          .attr('height', vars.legend.gradient.height);

        scale
          .transition()
          .duration(vars.draw.timing)
          .attr('opacity', 1);

        if (vars.dev.value) {
          print.timeEnd('drawing color scale');
        }
      } else {
        key_display = false;
      }
    } else {
      key_display = false;
    }
  } else {
    key_display = false;
  }
  if (vars.legend.value && key_display) {
    if (vars.dev.value) {
      print.time('positioning legend');
    }

    if (square_size) {
      var key_height = square_size + vars.ui.padding;
    } else {
      const key_box = vars.g.legend.node().getBBox();
      key_height = key_box.height + key_box.y;
    }

    if (vars.margin.bottom === 0) {
      vars.margin.bottom += vars.ui.padding;
    }
    vars.margin.bottom += key_height;

    vars.g.legend
      .transition()
      .duration(vars.draw.timing)
      .attr(
        'transform',
        'translate(0,' + (vars.height.value - vars.margin.bottom) + ')'
      );

    if (vars.dev.value) {
      print.timeEnd('positioning legend');
    }
  } else {
    if (vars.dev.value) {
      print.time('hiding legend');
    }

    vars.g.legend
      .transition()
      .duration(vars.draw.timing)
      .attr('transform', 'translate(0,' + vars.height.value + ')');

    if (vars.dev.value) {
      print.timeEnd('hiding legend');
    }
  }
};
