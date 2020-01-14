(() => {
  module.exports = vars => {
    var button, checks, color, icons, mouseevents, print, style, updatedButtons;
    print = require('../../../core/console/print.js');
    color = require('./functions/color.js');
    icons = require('./functions/icons.js');
    mouseevents = require('./functions/mouseevents.js');
    style = require('./functions/style.js');
    button = vars.container.ui
      .selectAll('div.d3po_node')
      .data(vars.data.viz, d => d[vars.id.value]);
    if (vars.dev.value) {
      print.time('enter');
    }
    button
      .enter()
      .append('div')
      .attr('class', 'd3po_node')
      .call(color, vars)
      .call(style, vars)
      .call(icons, vars)
      .call(mouseevents, vars);
    if (vars.dev.value) {
      print.timeEnd('enter');
    }
    if (vars.draw.update || vars.draw.timing) {
      if (vars.dev.value) {
        print.time('ordering');
      }
      button.order();
      if (vars.dev.value) {
        print.timeEnd('ordering');
      }
      updatedButtons = button;
    } else {
      checks = [
        vars.focus.previous,
        vars.focus.value,
        vars.hover.previous,
        vars.hover.value
      ].filter(c => c);
      updatedButtons = button.filter(
        b => checks.indexOf(b[vars.id.value]) >= 0
      );
    }
    if (vars.dev.value) {
      print.time('update');
    }
    updatedButtons.classed(
      'd3po_button_active',
      d => vars.focus.value === d[vars.id.value]
    );
    if (vars.draw.timing) {
      updatedButtons
        .transition()
        .duration(vars.draw.timing)
        .call(color, vars)
        .call(style, vars);
    } else {
      updatedButtons.call(color, vars).call(style, vars);
    }
    updatedButtons.call(icons, vars).call(mouseevents, vars);
    if (vars.dev.value) {
      print.timeEnd('update');
    }
    return button.exit().remove();
  };
}).call(this);
