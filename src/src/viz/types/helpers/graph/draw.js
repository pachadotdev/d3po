(() => {
  let axes;
  let draw;
  let mouse;
  let plot;

  axes = require('./includes/axes.js');

  draw = require('./includes/svg');

  mouse = require('./includes/mouse.js');

  plot = require('./includes/plot.js');

  module.exports = (vars, opts) => {
    if (opts === void 0) {
      opts = {};
    }
    axes(vars, opts);
    plot(vars, opts);
    draw(vars, opts);
    vars.mouse.viz = opts.mouse === true ? mouse : false;
  };
}).call(this);
