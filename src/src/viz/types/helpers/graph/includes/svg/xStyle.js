const textwrap = require('../../../../../../textwrap/textwrap.js');
const tickFont = require('./tickFont');
const getFontStyle = require('./getFontStyle');

const xStyle = (vars, rotated) => (group, axis) => {
  let groups;
  let offset;
  offset = axis === 'x' ? vars.axes.height : 0;
  groups = group
    .attr('transform', 'translate(0,' + offset + ')')
    .call(vars[axis].axis.svg.scale(vars[axis].scale.viz))
    .selectAll('g.tick');
  groups.selectAll('line').attr('y2', function(d) {
    let y2;
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
    .call(tickFont, axis, vars)
    .each(function(d) {
      d3.select(this)
        .attr('dy', '0px')
        .attr('font-size', d => getFontStyle(axis, d, 'size', vars) + 'px');
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
module.exports = xStyle;
