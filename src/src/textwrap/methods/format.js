(() => {
  let locale;
  let mergeObject;

  locale = require('../../core/locale/locale.js');

  mergeObject = require('../../object/merge.js');

  module.exports = {
    accepted: [Function, String],
    locale: {
      accepted: function() {
        return d3.keys(locale);
      },
      process: function(value) {
        let defaultLocale;
        let returnObject;
        defaultLocale = 'en_US';
        returnObject = locale[defaultLocale];
        if (value !== defaultLocale) {
          returnObject = mergeObject(returnObject, locale[value]);
        }
        this.language = value;
        return returnObject;
      },
      value: 'en_US'
    },
    process: function(value, vars) {
      if (this.initialized && typeof value === 'string') {
        vars.self.format({
          locale: value
        });
      } else {
        if (typeof value === 'function') {
          return value;
        }
      }
      return this.value;
    },
    value: 'en_US'
  };
}).call(this);
