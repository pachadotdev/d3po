// Formats numbers to look "pretty"
(function() {
  var defaultLocale;

  defaultLocale = require('../core/locale/languages/en_US.js');

  module.exports = function(number, opts) {
    var affixes,
      format,
      key,
      labels,
      length,
      locale,
      ret,
      sigs,
      symbol,
      time,
      vars,
      zeros;
    if (number === void 0 || number === null || number === false) {
      return '';
    }
    if (!opts) {
      opts = {};
    }
    if ('locale' in opts) {
      locale = opts.locale;
    } else {
      locale = defaultLocale;
    }
    time = locale.time.slice();
    format = d3.locale(locale.format);
    if (!opts) {
      opts = {};
    }
    vars = opts.vars || {};
    key = opts.key;
    labels = 'labels' in opts ? opts.labels : true;
    length = number.toString().split('.')[0].length;
    if (vars.time && vars.time.value) {
      time.push(vars.time.value);
    }
    if (typeof key === 'string' && time.indexOf(key.toLowerCase()) >= 0) {
      ret = number;
    } else if (key === 'share') {
      if (number === 0) {
        ret = 0;
      } else if (number >= 100) {
        ret = format.numberFormat(',f')(number);
      } else if (number > 99) {
        ret = format.numberFormat('.3g')(number);
      } else {
        ret = format.numberFormat('.2g')(number);
      }
      ret += '%';
    } else if (number < 10 && number > -10) {
      length = number.toString().split('.');
      sigs = 1;
      if (length.length > 1) {
        sigs = d3.min([parseFloat(length[1]).toString().length, 2]);
        if (!(-1 < number && number < 1)) {
          zeros = length[1].length - parseFloat(length[1]).toString().length;
          sigs += 1 + zeros;
        }
      }
      ret = format.numberFormat('.' + sigs + 'g')(number);
    } else if (length > 3) {
      symbol = d3.formatPrefix(number).symbol;
      symbol = symbol.replace('G', 'B');
      number = d3.formatPrefix(number).scale(number);
      number = format.numberFormat('.3g')(number);
      number = number.replace(locale.format.decimal, '.');
      number = parseFloat(number) + '';
      number = number.replace('.', locale.format.decimal);
      ret = number + symbol;
    } else if (length === 3) {
      ret = format.numberFormat(',f')(number);
    } else if (number === 0) {
      ret = 0;
    } else {
      if (number === parseInt(number, 10)) {
        ret = format.numberFormat('.2')(number);
      } else {
        ret = format.numberFormat('.3g')(number);
      }
    }
    if (ret.length > 2 && '' + ret.indexOf('.0') === ret.length - 2) {
      ret = ret.slice(0, ret.length - 2);
    }
    if (labels && key && 'format' in vars && key in vars.format.affixes.value) {
      affixes = vars.format.affixes.value[key];
      return affixes[0] + ret + affixes[1];
    } else {
      return ret;
    }
  };
}.call(this));
