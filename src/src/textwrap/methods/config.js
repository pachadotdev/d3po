(() => {
  module.exports = {
    accepted: [Object],
    objectAccess: false,
    process: function(value, vars) {
      let method;
      let setting;
      for (method in value) {
        setting = value[method];
        if (method in vars.self) {
          vars.self[method](setting);
        }
      }
      return value;
    },
    value: {}
  };
}).call(this);
