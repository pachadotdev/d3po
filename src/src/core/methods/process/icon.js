(() => {
  let stylesheet;

  stylesheet = require('../../../client/css.js');

  module.exports = (value, vars, method) => {
    if (
      value === false ||
      value.indexOf('fa-') < 0 ||
      (value.indexOf('fa-') === 0 && stylesheet('font-awesome'))
    ) {
      return value;
    } else {
      return method.fallback;
    }
  };
}).call(this);
