const buckets = require('../../../../util/buckets');
const print = require('../../../../core/console/print');
const groupByColors = require('./groupByColors');


//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
// Creates color key
//------------------------------------------------------------------------------
module.exports = vars => {
  let key_display = true;
  let square_size = 0;
  let colors;
  let key_width;
  let start_x;

  if (
    !vars.error.internal &&
    vars.color.value &&
    !vars.small &&
    vars.legend.value
  ) {
    if (!vars.color.valueScale) {
      const result = groupByColors(vars);
      square_size = result.square_size;
      if(result.key_display === false){
        key_display = false;
      }
      colors = result.colors;
      key_width = result.key_width;
      start_x = result.start_x;
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
