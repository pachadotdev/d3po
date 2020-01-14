(() => {
  var copy, objectMerge, objectValidate;

  objectMerge = require('../object/merge.js');

  objectValidate = require('../object/validate.js');

  copy = variable => {
    var ret;
    if (objectValidate(variable)) {
      return objectMerge(variable);
    } else if (variable instanceof Array) {
      ret = [];
      variable.forEach(o => ret.push(copy(o)));
      return ret;
    } else {
      return variable;
    }
  };

  module.exports = copy;
}).call(this);
