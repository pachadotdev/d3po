(() => {
  let align;
  let decoration;
  let family;
  let margin;
  let transform;

  family = require('../../core/methods/font/family.js');

  align = require('../../core/methods/font/align.js');

  decoration = require('../../core/methods/font/decoration.js');

  margin = require('../../core/methods/process/margin.js');

  transform = require('../../core/methods/font/transform.js');

  module.exports = {
    align: align('center'),
    border: 1,
    color: {
      primary: {
        process: function(value, vars) {
          let primary;
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
      align: align('center'),
      color: '#444',
      decoration: decoration(),
      family: family(),
      size: 11,
      transform: transform(),
      weight: 200
    },
    margin: {
      process: function(value) {
        let userValue;
        if (value === void 0) {
          value = this.value;
        }
        userValue = value;
        margin(value, this);
        return userValue;
      },
      value: 5
    },
    padding: {
      process: function(value) {
        let userValue;
        if (value === void 0) {
          value = this.value;
        }
        userValue = value;
        margin(value, this);
        return userValue;
      },
      value: 5
    }
  };
}).call(this);
