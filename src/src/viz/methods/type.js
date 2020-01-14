(() => {
  module.exports = {
    accepted: function(vars) {
      return d3.keys(vars.types);
    },
    mode: {
      accepted: function(vars) {
        return vars.types[vars.type.value].modes || [false];
      },
      value: false
    },
    value: 'treemap'
  };
}).call(this);
