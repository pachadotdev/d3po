const alignMap = {
  left: 'start',
  center: 'middle',
  right: 'end'
};
const lineFont = (text, axis, vars) => {
  let opp;
  opp = axis.indexOf('x') === 0 ? 'y' : 'x';
  return text
    .attr(opp, d => d.coords.text[opp] + 'px')
    .attr(axis, d => d.coords.text[axis] + 'px')
    .attr('dy', vars[axis].lines.font.position.value)
    .attr('text-anchor', alignMap[vars[axis].lines.font.align.value])
    .attr('transform', d => d.transform)
    .attr('font-size', vars[axis].lines.font.size + 'px')
    .attr('fill', d => d.color || vars[axis].lines.color)
    .attr('font-family', vars[axis].lines.font.family.value)
    .attr('font-weight', vars[axis].lines.font.weight);
};
module.exports = lineFont;
