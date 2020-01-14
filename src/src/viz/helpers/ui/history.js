// Creates "back" button, if applicable
(() => {
  var events, lighter, print;

  events = require('../../../client/pointer.js');

  lighter = require('../../../color/lighter.js');

  print = require('../../../core/console/print.js');

  module.exports = vars => {
    var button,
      color,
      containerPadding,
      family,
      left,
      min_height,
      padding,
      size,
      stripY,
      style,
      titleClass,
      titleGroup,
      top,
      weight;
    if (!vars.small && vars.history.value && vars.history.states.length > 0) {
      if (vars.dev.value) {
        print.time('drawing back button');
      }
      button = vars.container.value
        .selectAll('div#d3po_back_button')
        .data(['d3po_back_button'])
        .style('position', 'relative')
        .style('z-index', 1900);
      size = vars.title.sub.font.size;
      color = vars.title.sub.font.color;
      family = vars.title.sub.font.family.value;
      weight = vars.title.sub.font.weight;
      padding = vars.title.sub.padding;
      titleClass = false;
      if (
        vars.title.sub.value &&
        ['start', 'left'].indexOf(vars.title.sub.font.align) < 0
      ) {
        titleClass = 'sub';
      } else if (
        vars.title.total.value &&
        ['start', 'left'].indexOf(vars.title.total.font.align) < 0
      ) {
        titleClass = 'total';
      } else if (
        vars.title.value &&
        ['start', 'left'].indexOf(vars.title.font.align) < 0
      ) {
        titleClass = 'title';
      }
      if (titleClass) {
        stripY = elem => {
          var y;
          y = elem.attr('transform').match(/translate\(([^a-z]+)\)/gi)[0];
          y = y.replace(/([^a-z])\s([^a-z])/gi, '$1,$2');
          y = y.split(',');
          y = y[y.length - 1];
          return parseFloat(y.substring(0, y.length - 1));
        };
        titleGroup = vars.svg.select('.d3po_title.' + titleClass);
        top = stripY(titleGroup) + stripY(titleGroup.select('text'));
      } else {
        top = vars.margin.top - vars.title.padding;
        min_height = size + padding * 2;
        vars.margin.top += min_height;
      }
      containerPadding = parseFloat(
        vars.container.value.style('padding-top'),
        10
      );
      top += containerPadding;
      containerPadding = parseFloat(
        vars.container.value.style('padding-left'),
        10
      );
      left = vars.margin.left + size / 2 + containerPadding;
      style = elem =>
        elem
          .style('position', 'absolute')
          .style('left', left + 'px')
          .style('top', top + 'px')
          .style('color', color)
          .style('font-family', family)
          .style('font-weight', weight)
          .style('font-size', size + 'px');
      button
        .on(events.over, function() {
          if (!vars.small && vars.history.states.length > 0) {
            return d3
              .select(this)
              .style('cursor', 'pointer')
              .transition()
              .duration(vars.timing.mouseevents)
              .style('color', lighter(color, 0.25));
          }
        })
        .on(events.out, function() {
          if (!vars.small && vars.history.states.length > 0) {
            return d3
              .select(this)
              .style('cursor', 'auto')
              .transition()
              .duration(vars.timing.mouseevents)
              .style('color', color);
          }
        })
        .on(events.click, () => vars.history.back())
        .transition()
        .duration(vars.draw.timing)
        .style('opacity', 1)
        .call(style);
      if (vars.dev.value) {
        return print.timeEnd('drawing back button');
      }
    } else {
      return vars.container.value
        .selectAll('div#d3po_back_button')
        .transition()
        .duration(vars.draw.timing)
        .style('opacity', 0)
        .remove();
    }
  };
}).call(this);
