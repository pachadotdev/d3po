(() => {
  module.exports = {
    accepted: [Boolean, Function, String],
    agg: {
      accepted: [false, Function, 'sum', 'min', 'max', 'mean', 'median'],
      value: false
    },
    sort: {
      accepted: ['asc', 'desc'],
      value: 'desc'
    },
    value: false
  };
}).call(this);
