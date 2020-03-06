const tickPosition = (tick, axis, vars) =>
  tick
    .attr('x1', d => {
      if (axis.indexOf('x') === 0) {
        return vars.x.scale.viz(d);
      } else {
        return 0;
      }
    })
    .attr('x2', d => {
      if (axis.indexOf('x') === 0) {
        return vars.x.scale.viz(d);
      } else {
        return vars.axes.width;
      }
    })
    .attr('y1', d => {
      if (axis.indexOf('y') === 0) {
        return vars.y.scale.viz(d);
      } else {
        return 0;
      }
    })
    .attr('y2', d => {
      if (axis.indexOf('y') === 0) {
        return vars.y.scale.viz(d);
      } else {
        return vars.axes.height;
      }
    });
module.exports = tickPosition;
