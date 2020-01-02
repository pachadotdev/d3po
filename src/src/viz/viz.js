(function() {
  var attach, axis, container, flash, getSteps, print, validObject;

  attach = require('../core/methods/attach.js');

  axis = require('./methods/helpers/axis.js');

  flash = require('./helpers/ui/message.js');

  getSteps = require('./helpers/drawSteps.js');

  print = require('../core/console/print.js');

  container = require('./helpers/container.js');

  validObject = require('../object/validate.js');

  module.exports = function() {
    var vars;
    vars = {
      g: {
        apps: {}
      },
      types: {
        area: require('./types/area.js'),
        bar: require('./types/bar.js'),
        bubbles: require('./types/bubbles.js'),
        box: require('./types/box.js'),
        donut: require('./types/donut.js'),
        geomap: require('./types/geomap.js'),
        halfdonut: require('./types/halfdonut.js'),
        line: require('./types/line.js'),
        network: require('./types/network.js'),
        paths: require('./types/paths.js'),
        pie: require('./types/pie.js'),
        radar: require('./types/radar.js'),
        rings: require('./types/rings.js'),
        sankey: require('./types/sankey.js'),
        scatter: require('./types/scatter.js'),
        stacked: require('./types/area.js'),
        treemap: require('./types/treemap.js')
      }
    };
    vars.self = function(selection) {
      selection.each(function() {
        var lastMessage,
          nextStep,
          runFunction,
          runStep,
          small_height,
          small_width,
          steps;
        vars.draw.frozen = true;
        vars.error.internal = null;
        if (!('timing' in vars.draw)) {
          vars.draw.timing = vars.timing.transitions;
        }
        if (vars.error.value) {
          vars.draw.timing = 0;
        }
        container(vars);
        small_width = vars.width.value <= vars.width.small;
        small_height = vars.height.value <= vars.height.small;
        vars.small = small_width || small_height;
        vars.width.viz = vars.width.value;
        vars.height.viz = vars.height.value;
        lastMessage = false;
        nextStep = function() {
          if (steps.length) {
            runStep();
          } else {
            if (vars.dev.value) {
              print.groupEnd();
              print.timeEnd('total draw time');
              print.log('\n');
            }
          }
        };
        runFunction = function(step, name) {
          name = name || 'function';
          if (step[name] instanceof Array) {
            step[name].forEach(function(f) {
              f(vars, nextStep);
            });
          } else {
            if (typeof step[name] === 'function') {
              step[name](vars, nextStep);
            }
          }
          if (!step.wait) {
            nextStep();
          }
        };
        runStep = function() {
          var message, run, same, step;
          step = steps.shift();
          same = vars.g.message && lastMessage === step.message;
          run = 'check' in step ? step.check : true;
          if (typeof run === 'function') {
            run = run(vars);
          }
          if (run) {
            if (!same) {
              if (vars.dev.value) {
                if (lastMessage !== false) {
                  print.groupEnd();
                }
                print.group(step.message);
              }
              if (typeof vars.messages.value === 'string') {
                lastMessage = vars.messages.value;
                message = vars.messages.value;
              } else {
                lastMessage = step.message;
                message = vars.format.value(step.message);
              }
              if (vars.draw.update) {
                flash(vars, message);
                if (vars.error.value) {
                  runFunction(step);
                } else {
                  setTimeout(function() {
                    return runFunction(step);
                  }, 10);
                }
              } else {
                runFunction(step);
              }
            } else {
              runFunction(step);
            }
          } else {
            if ('otherwise' in step) {
              if (vars.error.value) {
                runFunction(step, 'otherwise');
              } else {
                setTimeout(function() {
                  return runFunction(step, 'otherwise');
                }, 10);
              }
            } else {
              nextStep();
            }
          }
        };
        vars.messages.style.backup =
          vars.group && vars.group.attr('opacity') === '1' ? 'small' : 'large';
        steps = getSteps(vars);
        runStep();
      });
      return vars.self;
    };
    attach(vars, {
      active: require('./methods/active.js'),
      aggs: require('./methods/aggs.js'),
      attrs: require('./methods/attrs.js'),
      axes: require('./methods/axes.js'),
      background: require('./methods/background.js'),
      class: require('./methods/class.js'),
      color: require('./methods/color.js'),
      cols: require('./methods/cols.js'),
      config: require('./methods/config.js'),
      container: require('./methods/container.js'),
      coords: require('./methods/coords.js'),
      csv: require('./methods/csv.js'),
      data: require('./methods/data.js'),
      depth: require('./methods/depth.js'),
      descs: require('./methods/descs.js'),
      dev: require('./methods/dev.js'),
      draw: require('./methods/draw.js'),
      edges: require('./methods/edges.js'),
      error: require('./methods/error.js'),
      focus: require('./methods/focus.js'),
      font: require('./methods/font.js'),
      footer: require('./methods/footer.js'),
      format: require('./methods/format.js'),
      height: require('./methods/height.js'),
      history: require('./methods/history.js'),
      icon: require('./methods/icon.js'),
      id: require('./methods/id.js'),
      labels: require('./methods/labels.js'),
      legend: require('./methods/legend.js'),
      links: require('./methods/links.js'),
      margin: require('./methods/margin.js'),
      messages: require('./methods/messages.js'),
      mouse: require('./methods/mouse.js'),
      nodes: require('./methods/nodes.js'),
      order: require('./methods/order.js'),
      resize: require('./methods/resize.js'),
      shape: require('./methods/shape.js'),
      size: require('./methods/size.js'),
      style: require('./methods/style.js'),
      temp: require('./methods/temp.js'),
      text: require('./methods/text.js'),
      time: require('./methods/time.js'),
      timeline: require('./methods/timeline.js'),
      timing: require('./methods/timing.js'),
      title: require('./methods/title.js'),
      tooltip: require('./methods/tooltip.js'),
      total: require('./methods/total.js'),
      type: require('./methods/type.js'),
      ui: require('./methods/ui.js'),
      width: require('./methods/width.js'),
      x: axis('x'),
      x2: axis('x2'),
      y: axis('y'),
      y2: axis('y2'),
      zoom: require('./methods/zoom.js')
    });
    return vars.self;
  };
}.call(this));
