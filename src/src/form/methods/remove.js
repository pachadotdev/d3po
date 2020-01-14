(() => {
  module.exports = {
    accepted: [void 0, Function],
    process: function(value, vars) {
      if (this.initialized) {
        vars.container.ui.remove();
      }
      delete vars.container.ui;
    },
    value: void 0
  };
}).call(this);
