const fetchText = require('../../../core/fetch/text.js');
const fetchValue = require('../../../core/fetch/value.js');
const mix = require('../../../color/mix.js');
const print = require('../../../core/console/print.js');
const segments = require('./segments.js');
const shapeColor = require('./color.js');
const stringList = require('../../../string/list.js');
const textColor = require('../../../color/text.js');
const textWrap = require('../../../textwrap/textwrap.js');

//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
// Draws "labels" using svg:text and d3po.textwrap
//------------------------------------------------------------------------------
module.exports = (vars, group) => {
  const scale = vars.types[vars.type.value].zoom
    ? vars.zoom.behavior.scaleExtent()
    : [1, 1];

  const selection = vars.g[group].selectAll('g');

  const opacity = elem => {
    elem.attr('opacity', function(d) {
      // if (vars.draw.timing) return 1;
      const size = parseFloat(d3.select(this).attr('font-size'), 10);
      d.visible = size * (vars.zoom.scale / scale[1]) >= 2;
      return d.visible ? 1 : 0;
    });
  };

  //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // Label Exiting
  //----------------------------------------------------------------------------
  const remove = text => {
    if (vars.draw.timing) {
      text
        .transition()
        .duration(vars.draw.timing)
        .attr('opacity', 0)
        .remove();
    } else {
      text.remove();
    }
  };

  //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // Label Styling
  //----------------------------------------------------------------------------
  const style = text => {
    text
      .attr('font-weight', vars.labels.font.weight)
      .attr('font-family', vars.labels.font.family.value)
      .attr('stroke', 'none')
      .attr('pointer-events', t => (t.mouse ? 'auto' : 'none'))
      .attr('fill', t => {
        if (t.color) {
          return t.color;
        }

        const color = shapeColor(t.parent, vars);
        const legible = textColor(color);
        const opacity = t.text ? 0 : 1;

        return mix(color, legible, 0.2, opacity);
      })
      .each(function(t) {
        let size = t.resize;
        let resize = true;

        if (!(t.resize instanceof Array)) {
          size = [7, 32 * (scale[1] / scale[0])];
          resize = t.resize;
        }

        const yOffset = vars.labels.valign.value === 'bottom' ? t.share : 0;

        if (isNaN(t.percentage)) {
          textWrap()
            .align(t.anchor || vars.labels.align.value)
            .container(d3.select(this))
            .height(t.h * scale[1] - t.share)
            .padding(t.padding / 2)
            .resize(resize)
            .size(size)
            .shape(t.shape || 'square')
            .text(t.names)
            .valign(vars.labels.valign.value)
            .width(t.w * scale[1])
            .x(t.x - (t.w * scale[1]) / 2 + t.padding / 2)
            .y(t.y - (t.h * scale[1]) / 2 + t.padding / 2 + yOffset)
            .draw();
        } else {
          textWrap()
            .align(t.anchor || vars.labels.align.value)
            .container(d3.select(this))
            .height(t.h * scale[1] - t.share)
            .padding(t.padding / 2)
            .resize(resize)
            .size(size)
            .shape(t.shape || 'square')
            .text(
              t.names +
                '\n' +
                vars.format.value(t.percentage * 100, {
                  key: 'share',
                  vars: vars
                })
            )
            .valign(vars.labels.valign.value)
            .width(t.w * scale[1])
            .x(t.x - (t.w * scale[1]) / 2 + t.padding / 2)
            .y(t.y - (t.h * scale[1]) / 2 + t.padding / 2 + yOffset)
            .draw();
        }
      })
      .attr('transform', function(t) {
        let translate = d3.select(this).attr('transform') || '';
        const a = t.angle || 0;
        const x = t.translate && t.translate.x ? t.translate.x : 0;
        const y = t.translate && t.translate.y ? t.translate.y : 0;

        if (translate.length) {
          translate = translate
            .split(')')
            .slice(-3)
            .join(')');
        }
        return (
          'rotate(' +
          a +
          ',' +
          x +
          ',' +
          y +
          ')scale(' +
          1 / scale[1] +
          ')translate(' +
          (t.x * scale[1] - t.x) +
          ',' +
          (t.y * scale[1] - t.y) +
          ')' +
          translate
        );
      });
  };

  //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // Loop through each selection and analyze the labels
  //----------------------------------------------------------------------------
  if (group === 'edges' || vars.labels.value) {
    if (vars.dev.value) {
      var timerString = 'drawing ' + group + ' labels';
      print.time(timerString);
    }

    selection.each(function(d) {
      const disabled = d.d3po && 'label' in d.d3po && !d.d3po.label;
      const label = d.d3po_label || null;

      let names = d.d3po.text
        ? d.d3po.text
        : label && label.names
        ? label.names
        : vars.labels.text.value
        ? fetchValue(vars, d, vars.labels.text.value)
        : fetchText(vars, d);

      const group = label && 'group' in label ? label.group : d3.select(this);
      const share_size = 0;
      const fill = vars.types[vars.type.value].fill;

      if (!(names instanceof Array)) {
        names = [names];
      }

      if (label) {
        if (['line', 'area'].indexOf(vars.shape.value) >= 0) {
          var background = true;
        } else if (d && 'd3po' in d) {
          const active = segments(vars, d, 'active');
          const temp = segments(vars, d, 'temp');
          const total = segments(vars, d, 'total');
          background =
            (!temp && !active) || active >= total || (!active && temp >= total);
        }
      }

      if (!disabled && ((label && label.force) || background || !fill)) {
        if (label) {
          label.resize =
            vars.labels.resize.value === false
              ? false
              : label && 'resize' in label
              ? label.resize
              : true;

          label.padding =
            typeof label.padding === 'number'
              ? label.padding
              : vars.labels.padding;
        }

        if (
          label &&
          label.w * scale[1] - label.padding >= 20 &&
          label.h * scale[1] - label.padding >= 10 &&
          names.length
        ) {
          const and = vars.format.locale.value.ui.and;
          const more = vars.format.locale.value.ui.more;

          for (let i = 0; i < names.length; i++) {
            if (names[i] instanceof Array) {
              names[i] = stringList(names[i], and, 3, more);
            }
          }

          label.names = names;
          label.share = share_size;
          label.percentage = d.d3po.share;
          label.parent = d;

          const text = group
            .selectAll('text#d3po_label_' + d.d3po.id)
            .data([label], t => {
              if (!t) {
                return false;
              }
              return t.names;
            });

          const fontSize = label.resize
            ? undefined
            : vars.labels.font.size * scale[0] + 'px';

          if (vars.draw.timing && vars.zoom.scale === 1) {
            text
              .transition()
              .duration(vars.draw.timing / 2)
              .call(style)
              .call(opacity);

            text
              .enter()
              .append('text')
              .attr('font-size', fontSize)
              .attr('id', 'd3po_label_' + d.d3po.id)
              .attr('class', 'd3po_label')
              .attr('opacity', 0)
              .call(style)
              .transition()
              .duration(vars.draw.timing / 2)
              .delay(vars.draw.timing / 2)
              .call(opacity);
          } else {
            text
              .attr('opacity', 1)
              .call(style)
              .call(opacity);

            text
              .enter()
              .append('text')
              .attr('font-size', fontSize)
              .attr('id', 'd3po_label_' + d.d3po.id)
              .attr('class', 'd3po_label')
              .call(style)
              .call(opacity);
          }

          text.exit().call(remove);

          if (text.size() === 0 || text.selectAll('tspan').size() === 0) {
            delete d.d3po_label;
            d3.select(this)
              .selectAll(
                'text#d3po_label_' +
                  d.d3po.id +
                  ', rect#d3po_label_bg_' +
                  d.d3po.id
              )
              .call(remove);
            vars.g.labels
              .selectAll(
                'text#d3po_label_' +
                  d.d3po.id +
                  ', rect#d3po_label_bg_' +
                  d.d3po.id
              )
              .call(remove);
          } else {
            if (label.background) {
              var background_data = ['background'];

              const box = text.node().getBBox();
              var bounds = {
                height: box.height,
                width: box.width,
                x: box.x,
                y: box.y > 0 ? box.y : -box.height / 2
              };
              bounds.width += vars.labels.padding * scale[0];
              bounds.height += vars.labels.padding * scale[0];
              bounds.x -= (vars.labels.padding * scale[0]) / 2;
              bounds.y -= (vars.labels.padding * scale[0]) / 2;
              let y = text
                .attr('transform')
                .match(/translate\(([^a-z]+)\)/gi)[0];
              y = y.replace(/([^a-z])\s([^a-z])/gi, '$1,$2');
              y = y.split(',');
              if (y.length > 1) {
                y = y[y.length - 1];
                y = y.substring(0, y.length - 1);
                bounds.y += parseFloat(y);
              }
            } else {
              background_data = [];
              bounds = {};
            }

            const bg = group
              .selectAll('rect#d3po_label_bg_' + d.d3po.id)
              .data(background_data);

            const bg_opacity =
              typeof label.background === 'number'
                ? label.background
                : typeof label.background === 'string'
                ? 1
                : 0.6;

            function bg_style(elem) {
              const color =
                typeof label.background === 'string'
                  ? label.background
                  : vars.background.value === 'none'
                  ? '#ffffff'
                  : vars.background.value;

              const fill =
                typeof label.background === 'string' ? label.background : color;

              let transform = text.attr('transform').split(')');
              transform.pop();
              transform.pop();
              transform.push('');
              transform = transform.join(')');

              elem
                .attr('fill', fill)
                .attr(bounds)
                .attr('transform', transform);
            }

            if (vars.draw.timing) {
              bg.exit()
                .transition()
                .duration(vars.draw.timing)
                .attr('opacity', 0)
                .remove();

              bg.transition()
                .duration(vars.draw.timing)
                .attr('opacity', bg_opacity)
                .call(bg_style);

              bg.enter()
                .insert('rect', '.d3po_label')
                .attr('id', 'd3po_label_bg_' + d.d3po.id)
                .attr('class', 'd3po_label_bg')
                .attr('opacity', 0)
                .call(bg_style)
                .transition()
                .duration(vars.draw.timing)
                .attr('opacity', bg_opacity);
            } else {
              bg.exit().remove();

              bg.enter()
                .insert('rect', '.d3po_label')
                .attr('id', 'd3po_label_bg_' + d.d3po.id)
                .attr('class', 'd3po_label_bg');

              bg.attr('opacity', bg_opacity).call(bg_style);
            }
          }
        } else {
          delete d.d3po_label;
          d3.select(this)
            .selectAll(
              'text#d3po_label_' +
                d.d3po.id +
                ', rect#d3po_label_bg_' +
                d.d3po.id
            )
            .call(remove);
          vars.g.labels
            .selectAll(
              'text#d3po_label_' +
                d.d3po.id +
                ', rect#d3po_label_bg_' +
                d.d3po.id
            )
            .call(remove);
        }
      } else {
        delete d.d3po_label;
        d3.select(this)
          .selectAll(
            'text#d3po_label_' + d.d3po.id + ', rect#d3po_label_bg_' + d.d3po.id
          )
          .call(remove);
        vars.g.labels
          .selectAll(
            'text#d3po_label_' + d.d3po.id + ', rect#d3po_label_bg_' + d.d3po.id
          )
          .call(remove);
      }
    });

    if (vars.dev.value) {
      print.timeEnd(timerString);
    }
  } else {
    if (vars.dev.value) {
      timerString = 'removing ' + group + ' labels';
      print.time(timerString);
    }

    selection.selectAll('text.d3po_label, rect.d3po_label_bg').call(remove);

    vars.g.labels.selectAll('text.d3po_label, rect.d3po_label_bg').call(remove);

    if (vars.dev.value) {
      print.timeEnd(timerString);
    }
  }
};
