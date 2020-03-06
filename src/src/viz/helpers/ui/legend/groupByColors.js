const arraySort = require('../../../../array/sort');
const copy = require('../../../../util/copy');
const dataNest = require('../../../../core/data/nest');
const fetchValue = require('../../../../core/fetch/value');
const fetchColor = require('../../../../core/fetch/color');
const uniqueValues = require('../../../../util/uniques');
const styleRect = require('./styleRect');
const legendTooltip = require('./legendTooltip');

module.exports = function groupByColors(vars) {
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

      const uniqueIDs = uniqueValues(data, d => fetchValue(vars, d, colorKey));
      const uniqueColors = uniqueValues(data, colorFunction);

      if (uniqueIDs.length >= uniqueColors.length && uniqueColors.length > 1) {
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

  let square_size = vars.legend.size;

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

  let key_display;
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
      legendTooltip(keys, vars, square_size, colorKey, colorDepth);
    }

    if (vars.dev.value) {
      print.timeEnd('drawing legend');
    }
  }

  return { square_size, key_display, colors, key_width, start_x };
};
