// Converts an array of strings into a string list using commas and "and"
(function() {
  var format, locale;

  format = require('./format.js');

  locale = require('../core/locale/languages/en_US.js').ui;

  module.exports = function(list, andText, max, moreText) {
    var amount;
    if (!(list instanceof Array)) {
      return list;
    } else {
      list = list.slice(0);
    }
    if (!andText) {
      andText = locale.and;
    }
    if (!moreText) {
      moreText = locale.moreText;
    }
    if (list.length === 2) {
      return list.join(' ' + andText + ' ');
    } else {
      if (max && list.length > max) {
        amount = list.length - max + 1;
        list = list.slice(0, max - 1);
        list[max - 1] = format(moreText, amount);
      }
      if (list.length > 1) {
        list[list.length - 1] = andText + ' ' + list[list.length - 1];
      }
      return list.join(', ');
    }
  };
}.call(this));
