(() => {
  let fontTester;

  fontTester = require('../core/font/tester.js');

  module.exports = (words, style, opts) => {
    let attr;
    let getHeight;
    let getWidth;
    let sizes;
    let spacing;
    let tester;
    let tspans;
    if (!opts) {
      opts = {};
    }
    style = style || {};
    tester = opts.parent || fontTester('svg').append('text');
    sizes = [];
    if (!(words instanceof Array)) {
      words = [words];
    }
    tspans = tester.selectAll('tspan').data(words);
    attr = {
      left: '0px',
      position: 'absolute',
      top: '0px',
      x: 0,
      y: 0
    };
    spacing = 0;
    if ('letter-spacing' in style) {
      spacing = parseFloat(style['letter-spacing']);
      delete style['letter-spacing'];
    }
    getWidth = elem => {
      let add;
      add = 0;
      if (spacing) {
        add = (d3.select(elem).text().length - 1) * spacing;
      }
      return elem.getComputedTextLength() + add;
    };
    getHeight = elem =>
      elem.parentNode.getBBox().height || elem.getBoundingClientRect().height;
    tspans
      .enter()
      .append('tspan')
      .text(String)
      .style(style)
      .attr(attr)
      .each(function() {
        if (typeof opts.mod === 'function') {
          return opts.mod(this);
        }
      })
      .each(function(d) {
        let children;
        let height;
        let width;
        children = d3.select(this).selectAll('tspan');
        if (children.size()) {
          width = [];
          children.each(function() {
            return width.push(getWidth(this));
          });
          width = d3.max(width);
        } else {
          width = getWidth(this);
        }
        height = getHeight(this);
        return sizes.push({
          height: height,
          text: d,
          width: width
        });
      });
    tspans.remove();
    if (!opts.parent) {
      tester.remove();
    }
    return sizes;
  };
}).call(this);
