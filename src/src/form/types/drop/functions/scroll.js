const print = require('../../../../core/console/print.js');
//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
// Calculates scroll position of list.
//------------------------------------------------------------------------------
module.exports = vars => {
  if (vars.open.value) {
    if (vars.dev.value) {
      print.time('calculating height');
    }

    let hidden = false;
    if (vars.container.selector.style('display') == 'none') {
      hidden = true;
    }

    if (hidden) {
      vars.container.selector.style('display', 'block');
    }

    const old_height = vars.container.selector.style('height');
    const old_scroll = vars.container.selector.property('scrollTop');
    const list_height = vars.container.list.style('max-height');
    const list_scroll = vars.container.list.property('scrollTop');

    vars.container.selector.style('height', 'auto');
    vars.container.list.style('max-height', '200000px');

    vars.container.listHeight = parseFloat(
      vars.container.selector.style('height'),
      10
    );

    vars.container.list
      .style('max-height', list_height)
      .property('scrollTop', list_scroll);

    vars.container.selector
      .style('height', old_height)
      .property('scrollTop', old_scroll);

    let scrolling = false;
    if (vars.container.listHeight > vars.height.secondary) {
      vars.container.listHeight = vars.height.secondary;
      scrolling = true;
    }

    if (hidden) {
      vars.container.selector.style('display', 'none');
    }

    if (vars.dev.value) {
      print.timeEnd('calculating height');
    }

    if (scrolling) {
      if (vars.dev.value) {
        print.time('calculating scroll position');
      }

      const options = vars.container.list
        .select('div')
        .selectAll('div.d3po_node');
      let option = options[0][0];
      const matchID =
        typeof vars.hover.value !== 'boolean'
          ? vars.hover.value
          : vars.focus.value;
      options.each(function(d) {
        if (d[vars.id.value] === matchID) {
          option = this;
        }
      });

      hidden = false;
      if (vars.container.selector.style('display') === 'none') {
        hidden = true;
        vars.container.selector.style('display', 'block');
      }

      const button_top = option.offsetTop;

      const button_height =
        option.offsetHeight || option.getBoundingClientRect().height;

      const list_top = vars.container.list.property('scrollTop');

      if (hidden) {
        vars.container.selector.style('display', 'none');
      }

      if (hidden || vars.data.changed || vars.depth.changed) {
        vars.container.listScroll = button_top;
      } else {
        vars.container.listScroll = list_top;

        if (button_top < list_top) {
          vars.container.listScroll = button_top;
        } else if (
          button_top + button_height >
          list_top + vars.height.secondary - vars.search.height
        ) {
          vars.container.listScroll =
            button_top -
            (vars.height.secondary - button_height - vars.search.height);
        }
      }

      if (vars.dev.value) {
        print.timeEnd('calculating scroll position');
      }
    } else {
      vars.container.listScroll = 0;
    }
  } else {
    vars.container.listScroll = vars.container.list.property('scrollTop');
    vars.container.listHeight = 0;
  }
};
