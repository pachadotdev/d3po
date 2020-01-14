(() => {
  var decoration, family, stringStrip, transform;

  decoration = require('../../core/methods/font/decoration.js');

  family = require('../../core/methods/font/family.js');

  transform = require('../../core/methods/font/transform.js');

  stringStrip = require('../../string/strip.js');

  module.exports = {
    accepted: [false, Function, String],
    font: {
      align: 'center',
      color: '#444444',
      decoration: decoration(),
      family: family(),
      size: 16,
      transform: transform(),
      weight: 400
    },
    height: false,
    link: false,
    padding: 2,
    position: 'top',
    process: function(value, vars) {
      var id;
      if (vars.container.id.indexOf('default') === 0 && value) {
        id = stringStrip(value).toLowerCase();
        vars.self.container({
          id: id
        });
      }
      return value;
    },
    sub: {
      accepted: [false, Function, String],
      font: {
        align: 'center',
        color: '#444444',
        decoration: decoration(),
        family: family(),
        size: 12,
        transform: transform(),
        weight: 400
      },
      link: false,
      padding: 1,
      position: 'top',
      value: false
    },
    total: {
      accepted: [Boolean, Object],
      font: {
        align: 'center',
        color: '#444444',
        decoration: decoration(),
        family: family(),
        size: 12,
        transform: transform(),
        weight: 400,
        value: false
      },
      link: false,
      padding: 1,
      position: 'top',
      value: false
    },
    width: false,
    value: false
  };
}).call(this);
