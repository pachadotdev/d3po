//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
// Checks to see if a given variable is allowed to be selected.
//------------------------------------------------------------------------------
module.exports = function(vars, value, active) {
  const ret = [];
  active = active || vars.active.value;

  if (active instanceof Array) {
    for (let i = 0; i < active.length; i++) {
      ret.push(this(vars, value, active[i]));
    }
  } else {
    const t = typeof active;

    if (t === 'number') {
      ret.push(vars.depth.value === active);
    } else if (t === 'function') {
      ret.push(active(value));
    } else {
      ret.push(value === active);
    }
  }

  return ret.indexOf(true) >= 0;
};
