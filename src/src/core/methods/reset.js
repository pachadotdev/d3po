// Resets certain keys in global variables
(() => {
  let reset;
  let validObject;

  validObject = require('../../object/validate.js');

  reset = (obj, method) => {
    let o;
    if (obj.changed) {
      obj.changed = false;
    }
    if (method === 'draw') {
      obj.frozen = false;
      obj.update = true;
      obj.first = false;
    }
    for (o in obj) {
      if (o.indexOf('d3po') < 0 && validObject(obj[o])) {
        reset(obj[o], o);
      }
    }
  };

  module.exports = reset;
}).call(this);
