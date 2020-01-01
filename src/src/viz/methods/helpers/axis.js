(function() {
  var align,
    decoration,
    family,
    filter,
    orientMap,
    position,
    rendering,
    transform;

  align = require('../../../core/methods/font/align.js');

  decoration = require('../../../core/methods/font/decoration.js');

  family = require('../../../core/methods/font/family.js');

  filter = require('../../../core/methods/filter.js');

  position = require('../../../core/methods/font/position.js');

  rendering = require('../../../core/methods/rendering.js');

  transform = require('../../../core/methods/font/transform.js');

  orientMap = {
    x: 'bottom',
    x2: 'top',
    y: 'left',
    y2: 'right'
  };

  module.exports = function(axis) {
    return {
      accepted: [Array, Boolean, Function, Object, String],
      affixes: {
        accepted: [Boolean],
        separator: {
          accepted: [Boolean, Array],
          value: true
        },
        value: false
      },
      axis: {
        accepted: [Boolean],
        color: '#444',
        font: {
          color: false,
          decoration: decoration(false),
          family: family(''),
          size: false,
          spacing: 0,
          transform: transform(false),
          weight: false
        },
        rendering: rendering(),
        value: true
      },
      dataFilter: true,
      domain: {
        accepted: [false, Array],
        value: false
      },
      grid: {
        accepted: [Boolean],
        color: '#ccc',
        rendering: rendering(),
        value: true
      },
      label: {
        accepted: [Boolean, String],
        fetch: function(vars) {
          if (this.value === true) {
            return vars.format.value(vars[axis].value, {
              key: axis,
              vars: vars
            });
          }
          return this.value;
        },
        font: {
          color: '#444',
          decoration: decoration(),
          family: family(),
          size: 12,
          spacing: 0,
          transform: transform(),
          weight: 400
        },
        padding: 3,
        value: true
      },
      lines: {
        accept: [false, Array, Number, Object],
        dasharray: {
          accepted: [Array, String],
          process: function(value) {
            if (value instanceof Array) {
              value = value.filter(function(d) {
                return !isNaN(d);
              });
              value = value.length ? value.join(', ') : 'none';
            }
            return value;
          },
          value: '10, 10'
        },
        color: '#888',
        font: {
          align: align('right'),
          color: '#444',
          background: {
            accepted: [Boolean],
            value: true
          },
          decoration: decoration(),
          family: family(),
          padding: {
            accepted: [Number],
            value: 10
          },
          position: position('middle'),
          size: 12,
          transform: transform(),
          weight: 400
        },
        process: Array,
        rendering: rendering(),
        width: 1,
        value: []
      },
      mouse: {
        accept: [Boolean],
        dasharray: {
          accepted: [Array, String],
          process: function(value) {
            if (value instanceof Array) {
              value = value.filter(function(d) {
                return !isNaN(d);
              });
              value = value.length ? value.join(', ') : 'none';
            }
            return value;
          },
          value: 'none'
        },
        rendering: rendering(),
        width: 2,
        value: true
      },
      mute: filter(true),
      orient: {
        accepted: ['top', 'right', 'bottom', 'left'],
        value: orientMap[axis]
      },
      padding: {
        accepted: [Number],
        value: 0.1
      },
      persist: {
        position: {
          accepted: [Boolean],
          value: false
        },
        size: {
          accepted: [Boolean],
          value: true
        }
      },
      range: {
        accepted: [false, Array],
        value: false
      },
      scale: {
        accepted: ['linear', 'log', 'discrete', 'share'],
        process: function(value, vars) {
          var i, len, ref, scale;
          ref = ['log', 'discrete', 'share'];
          for (i = 0, len = ref.length; i < len; i++) {
            scale = ref[i];
            if (scale === value) {
              vars.axes[scale] = axis;
            } else {
              if (vars.axes[scale] === axis) {
                vars.axes[scale] = false;
              }
            }
          }
          if (value === 'discrete') {
            vars.axes.opposite = axis.indexOf('x') === 0 ? 'y' : 'x';
          }
          return value;
        },
        value: 'linear'
      },
      solo: filter(true),
      stacked: {
        accepted: [Boolean],
        process: function(value, vars) {
          if (!value && vars.axes.stacked === axis) {
            vars.axes.stacked = false;
          } else {
            if (value) {
              vars.axes.stacked = axis;
            }
          }
          return value;
        },
        value: false
      },
      ticks: {
        accepted: [false, Array],
        color: '#ccc',
        font: {
          color: '#666',
          decoration: decoration(),
          family: family(),
          size: 10,
          spacing: 0,
          transform: transform(),
          weight: 400
        },
        labels: {
          accepted: [Boolean, Array],
          value: true
        },
        rendering: rendering(),
        size: 10,
        width: 1,
        value: false
      },
      value: false,
      zerofill: {
        accepted: [Boolean],
        value: false
      }
    };
  };
}.call(this));
