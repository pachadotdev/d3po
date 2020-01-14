const events = require('../../../../client/pointer.js');
const lighter = require('../../../../color/lighter.js');
const print = require('../../../../core/console/print.js');
const textColor = require('../../../../color/text.js');

//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
// Creates and styles the title and back button.
//------------------------------------------------------------------------------
module.exports = vars => {
  if (vars.open.value) {
    if (vars.dev.value) {
      print.time('creating title and back button');
    }

    const enabled = vars.id.solo.value.length === 1 && vars.depth.value > 0;
    let title = enabled;
    const focus = vars.container.button.data(Object).viz[0];

    title = true;
    for (let i = 0; i < vars.id.nesting.length; i++) {
      const level = vars.id.nesting[i];
      if (level in focus && focus[level] === vars.focus.value) {
        title = false;
        break;
      }
    }

    vars.container.title = vars.container.selector
      .selectAll('div.d3po_drop_title')
      .data(enabled ? ['title'] : []);

    function boxStyle(elem) {
      elem
        .style('padding', vars.ui.padding.css)
        .style('display', 'block')
        .style('background-color', vars.ui.color.secondary.value)
        .style('font-family', vars.font.secondary.family.value)
        .style('font-size', vars.font.secondary.size + 'px')
        .style('font-weight', vars.font.secondary.weight)
        .style('text-align', vars.font.secondary.align)
        .style('color', textColor(vars.ui.color.secondary.value));
    }

    function backStyle(elem) {
      if (!elem.empty()) {
        let className =
          vars.icon.back.value.indexOf('fa-') === 0
            ? ' fa ' + vars.icon.back.value
            : '';
        className = 'd3po_drop_back' + className;

        const text =
          vars.icon.back.value.indexOf('fa-') === 0 ? '' : vars.icon.back.value;

        elem
          .style('position', 'absolute')
          .attr('class', className)
          .style(
            'top',
            vars.ui.padding.top + vars.font.secondary.size / 2 / 2.5 + 'px'
          )
          .html(text);
      }
    }

    function titleStyle(elem) {
      const text = title ? vars.focus.value : vars.format.locale.value.ui.back;

      elem
        .text(vars.format.value(text))
        .style(
          'padding',
          '0px ' + (vars.ui.padding.left + vars.ui.padding.right) + 'px'
        );
    }

    if (vars.draw.timing) {
      vars.container.title
        .transition()
        .duration(vars.draw.timing)
        .call(boxStyle);

      vars.container.title
        .select('div.d3po_drop_title_text')
        .transition()
        .duration(vars.draw.timing)
        .call(titleStyle);
    } else {
      vars.container.title.call(boxStyle);

      vars.container.title.select('div.d3po_drop_title_text').call(titleStyle);
    }

    vars.container.title.select('span.d3po_drop_back').call(backStyle);

    const enter = vars.container.title
      .enter()
      .insert('div', '#d3po_drop_list_' + vars.container.id)
      .attr('class', 'd3po_drop_title')
      .attr('id', 'd3po_drop_title_' + vars.container.id)
      .call(boxStyle);

    enter
      .append('span')
      .attr('id', 'd3po_drop_back_' + vars.container.id)
      .attr('class', 'd3po_drop_back')
      .call(backStyle);

    enter
      .append('div')
      .attr('id', 'd3po_drop_title_text_' + vars.container.id)
      .attr('class', 'd3po_drop_title_text')
      .call(titleStyle);

    vars.container.title
      .on(events.over, function() {
        const color = lighter(vars.ui.color.secondary.value);

        d3.select(this)
          .style('cursor', 'pointer')
          .transition()
          .duration(vars.timing.mouseevents)
          .style('background-color', color)
          .style('color', textColor(color));
      })
      .on(events.out, function() {
        const color = vars.ui.color.secondary.value;

        d3.select(this)
          .style('cursor', 'auto')
          .transition()
          .duration(vars.timing.mouseevents)
          .style('background-color', color)
          .style('color', textColor(color));
      })
      .on(events.click, () => {
        vars.history.back();
      });

    vars.container.title.exit().remove();

    if (enabled) {
      vars.margin.title +=
        vars.container.title.node().offsetHeight ||
        vars.container.title.node().getBoundingClientRect().height;
    }

    if (vars.dev.value) {
      print.timeEnd('creating title and back button');
    }
  }
};
