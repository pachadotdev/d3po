// Flows the text into the container
(() => {
  let foreign;
  let tspan;

  foreign = require('./foreign.js');

  tspan = require('./tspan.js');

  module.exports = vars => {
    if (vars.text.html.value) {
      foreign(vars);
    } else {
      tspan(vars);
    }
  };
}).call(this);
