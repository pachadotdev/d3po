(() => {
  let align;
  let decoration;
  let family;
  let transform;

  align = require('../../core/methods/font/align.js');

  decoration = require('../../core/methods/font/decoration.js');

  family = require('../../core/methods/font/family.js');

  transform = require('../../core/methods/font/transform.js');

  module.exports = {
    align: align(),
    color: '#444444',
    decoration: decoration(),
    family: family(),
    secondary: {
      align: align(),
      color: '#444444',
      decoration: decoration(),
      family: family(),
      size: 12,
      spacing: 0,
      transform: transform(),
      weight: 400
    },
    size: 12,
    spacing: 0,
    transform: transform(),
    weight: 400
  };
}).call(this);
