(() => {
  module.exports = {
    accepted: [Boolean],
    back: function() {
      if (this.states.length) {
        return this.states.pop()();
      }
    },
    chain: [],
    reset: function() {
      let results;
      results = [];
      while (this.states.length) {
        results.push(this.states.pop()());
      }
      return results;
    },
    states: [],
    value: true
  };
}).call(this);
