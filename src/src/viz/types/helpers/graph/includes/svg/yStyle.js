const tickFont = require('./tickFont');

const yStyle = vars => (group, axis) => {
  let groups;
  let offset;
  offset = axis === 'y2' ? vars.axes.width : 0;
  groups = group
    .attr('transform', 'translate(' + offset + ', 0)')
    .call(vars[axis].axis.svg.scale(vars[axis].scale.viz))
    .selectAll('g.tick');
  groups.selectAll('line').attr('y2', function(d) {
    let y2;
    if (d.constructor === Date) {
      d = +d;
    }
    y2 = d3.select(this).attr('y2');
    if (vars.x.ticks.visible.indexOf(d) >= 0) {
      return y2;
    } else {
      return y2 / 2;
    }
  });
  return groups.select('text').call(tickFont, axis, vars);
};
module.exports = yStyle;
