(() => {
  let family;
  let transform;

  family = require('../../core/methods/font/family.js');

  transform = require('../../core/methods/font/transform.js');

  module.exports = {
    accepted: [Boolean, Array, Function, Object, String],
    anchor: 'top center',
    background: '#f4f4f4',
    children: {
      accepted: [Boolean, Number],
      value: true
    },
    connections: {
      accepted: [Boolean],
      value: true
    },
    curtain: {
      color: '#ddd',
      opacity: 0.8
    },
    extent: {
      accepted: [Boolean],
      value: true
    },
    font: {
      color: '#444',
      family: family(),
      size: 12,
      transform: transform(),
      weight: 400
    },
    fullscreen: {
      accepted: [Boolean],
      value: false
    },
    html: {
      accepted: [false, Function, Object, String],
      value: false
    },
    iqr: {
      accepted: [Boolean],
      value: true
    },
    large: 250,
    share: {
      accepted: [Boolean],
      value: true
    },
    size: {
      accepted: [Boolean],
      value: true
    },
    small: 225,
    stacked: {
      accepted: [Boolean],
      value: false
    },
    sub: {
      accepted: [false, Function, String],
      value: false
    },
    value: true
  };
}).call(this);
