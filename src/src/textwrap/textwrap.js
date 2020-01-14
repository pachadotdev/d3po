// Word wraps SVG text
(() => {
  let attach;
  let print;
  let sizes;
  let text;
  let wrap;

  attach = require('../core/methods/attach.js');

  sizes = require('./helpers/parsesize.js');

  print = require('../core/console/print.js');

  text = require('./helpers/parsetext.js');

  wrap = require('./helpers/wrap.js');

  module.exports = () => {
    let vars;
    vars = {
      self: function(selection) {
        selection.each(() => {
          sizes(vars);
          if (vars.size.value[0] <= vars.height.inner) {
            text(vars);
            wrap(vars);
          } else {
            vars.container.value.html('');
          }
          if (vars.dev.value) {
            print.timeEnd('total draw time');
          }
        });
        return vars.self;
      }
    };
    attach(vars, {
      align: require('./methods/align.js'),
      config: require('./methods/config.js'),
      container: require('./methods/container.js'),
      dev: require('./methods/dev.js'),
      draw: require('./methods/draw.js'),
      format: require('./methods/format.js'),
      height: require('./methods/height.js'),
      padding: require('./methods/padding.js'),
      resize: require('./methods/resize.js'),
      rotate: require('./methods/rotate.js'),
      text: require('./methods/text.js'),
      shape: require('./methods/shape.js'),
      size: require('./methods/size.js'),
      valign: require('./methods/valign.js'),
      width: require('./methods/width.js'),
      x: require('./methods/x.js'),
      y: require('./methods/y.js')
    });
    return vars.self;
  };
}).call(this);
