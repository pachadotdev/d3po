(() => {
  var align, decoration, family, transform;

  family = require('../../core/methods/font/family.js');

  align = require('../../core/methods/font/align.js');

  decoration = require('../../core/methods/font/decoration.js');

  transform = require('../../core/methods/font/transform.js');

  module.exports = {
    accepted: [Array, Boolean],
    align: align('center'),
    border: 1,
    color: {
      primary: {
        process: function(value, vars) {
          var primary;
          primary = this.value;
          if (!vars.ui.color.secondary.value) {
            vars.ui.color.secondary.value = d3
              .rgb(primary)
              .darker(0.75)
              .toString();
          }
          return value;
        },
        value: '#ffffff'
      },
      secondary: {
        value: false
      }
    },
    display: {
      acceped: ['block', 'inline-block'],
      value: 'inline-block'
    },
    font: {
      align: 'center',
      color: '#444',
      decoration: decoration(),
      family: family(),
      size: 11,
      transform: transform(),
      weight: 400
    },
    margin: 5,
    padding: 5,
    position: {
      accepted: ['top', 'right', 'bottom', 'left'],
      value: 'bottom'
    },
    value: false
  };
}).call(this);
