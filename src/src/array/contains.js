(() => {
  module.exports = (arr, value) => {
    let constructor;
    if (arr instanceof Array) {
      constructor =
        value === void 0 || value === null ? value : value.constructor;
      return arr.indexOf(value) >= 0 || arr.indexOf(constructor) >= 0;
    } else {
      return false;
    }
  };
}).call(this);
