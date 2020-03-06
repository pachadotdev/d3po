const mix = require('../../../../../../color/mix.js');
const getFontStyle = require('./getFontStyle');

const tickFont = (tick, axis, vars) => {
  let log;
  log = vars[axis].scale.value === 'log';
  return tick
    .attr('font-size', d => getFontStyle(axis, d, 'size', vars) + 'px')
    .attr('stroke', 'none')
    .attr('fill', d => {
      let color;
      color = getFontStyle(axis, d, 'color', vars);
      if (
        !log ||
        Math.abs(d)
          .toString()
          .charAt(0) === '1'
      ) {
        return color;
      } else {
        return mix(color, vars.background.value, 0.4, 1);
      }
    })
    .attr('font-family', d => getFontStyle(axis, d, 'family', vars).value)
    .attr('font-weight', d => getFontStyle(axis, d, 'weight', vars))
    .style(
      'text-transform',
      d => getFontStyle(axis, d, 'transform', vars).value
    )
    .style(
      'letter-spacing',
      d => getFontStyle(axis, d, 'spacing', vars) + 'px',
      vars
    );
};
module.exports = tickFont;
