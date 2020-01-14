// Detects scrollbar width for current browser
(() => {
  let scrollbar;

  scrollbar = () => {
    let inner;
    let outer;
    let val;
    let w1;
    let w2;
    inner = document.createElement('p');
    inner.style.width = '100%';
    inner.style.height = '200px';
    outer = document.createElement('div');
    outer.style.position = 'absolute';
    outer.style.top = '0px';
    outer.style.left = '0px';
    outer.style.visibility = 'hidden';
    outer.style.width = '200px';
    outer.style.height = '150px';
    outer.style.overflow = 'hidden';
    outer.appendChild(inner);
    document.body.appendChild(outer);
    w1 = inner.offsetWidth;
    outer.style.overflow = 'scroll';
    w2 = inner.offsetWidth;
    if (w1 === w2) {
      w2 = outer.clientWidth;
    }
    document.body.removeChild(outer);
    val = w1 - w2;
    scrollbar = () => val;
    return val;
  };

  module.exports = scrollbar;
}).call(this);
