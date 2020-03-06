const lineStyle = (line, axis, vars) => {
  let max;
  let opp;
  max = axis.indexOf('x') === 0 ? 'height' : 'width';
  opp = axis.indexOf('x') === 0 ? 'y' : 'x';
  return line
    .attr(opp + '1', 0)
    .attr(opp + '2', vars.axes[max])
    .attr(axis + '1', d => d.coords.line)
    .attr(axis + '2', d => d.coords.line)
    .attr('stroke', d => d.color || vars[axis].lines.color)
    .attr('stroke-width', vars[axis].lines.width)
    .attr('shape-rendering', vars[axis].lines.rendering.value)
    .attr('stroke-dasharray', vars[axis].lines.dasharray.value);
};
module.exports = lineStyle;
