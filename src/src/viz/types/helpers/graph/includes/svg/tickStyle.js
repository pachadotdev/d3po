const mix = require('../../../../../../color/mix.js');

const tickStyle = (tick, axis, grid, vars) => {
  let color;
  let log;
  let visibles;
  color = grid ? vars[axis].grid.color : vars[axis].ticks.color;
  log = vars[axis].scale.value === 'log';
  visibles = vars[axis].ticks.visible || [];
  return tick
    .attr('stroke', d => {
      let visible;
      if (d === 0) {
        return vars[axis].axis.color;
      }
      if (d.constructor === Date) {
        d = +d;
      }
      visible = visibles.indexOf(d) >= 0;
      if (
        visible &&
        (!log ||
          Math.abs(d)
            .toString()
            .charAt(0) === '1')
      ) {
        return color;
      } else if (grid && vars.axes.background.color !== 'transparent') {
        return mix(color, vars.axes.background.color, 0.4, 1);
      } else if (vars.background.value !== 'transparent') {
        return mix(color, vars.background.value, 0.4, 1);
      } else {
        return mix(color, 'white', 0.4, 1);
      }
    })
    .attr('stroke-width', vars[axis].ticks.width)
    .attr('shape-rendering', vars[axis].ticks.rendering.value);
};
module.exports = tickStyle;
