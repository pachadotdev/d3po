(() => {
  var rtl;

  rtl = require('../../../client/rtl.js');

  module.exports = align => {
    var accepted;
    accepted = ['left', 'center', 'right'];
    if (align === false) {
      accepted.unshift(false);
    }
    if (accepted.indexOf(align) < 0) {
      align = 'left';
    }
    return {
      accepted: accepted,
      process: function(value) {
        if (rtl) {
          if (value === 'left') {
            return 'right';
          } else {
            if (value === 'right') {
              return 'left';
            } else {
              return value;
            }
          }
        } else {
          return value;
        }
      },
      value: align
    };
  };
}).call(this);
