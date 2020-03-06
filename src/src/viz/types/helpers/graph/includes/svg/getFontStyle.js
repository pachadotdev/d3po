const getFontStyle = (axis, val, style, vars) => {
  let type;
  type = val === 0 ? 'axis' : 'ticks';
  val = vars[axis][type].font[style];
  if (val && (val.length || typeof val === 'number')) {
    return val;
  } else {
    return vars[axis].ticks.font[style];
  }
};
module.exports = getFontStyle;
