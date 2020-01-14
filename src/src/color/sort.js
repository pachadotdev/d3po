(() => {
  module.exports = (a, b) => {
    let aHSL;
    let bHSL;
    aHSL = d3.hsl(a);
    bHSL = d3.hsl(b);
    a = aHSL.s === 0 ? 361 : aHSL.h;
    b = bHSL.s === 0 ? 361 : bHSL.h;
    if (a === b) {
      return aHSL.l - bHSL.l;
    } else {
      return a - b;
    }
  };
}).call(this);
