(() => {
  module.exports = vars => {
    let diff;
    let elem;
    let height;
    let prev;
    let radius;
    let shape;
    let size;
    let width;
    let x;
    let y;
    elem = vars.container.value;
    prev = elem.node().previousElementSibling;
    shape = prev ? prev.tagName.toLowerCase() : '';
    if (prev) {
      prev = d3.select(prev);
    }
    vars.container.x = vars.x.value || parseFloat(elem.attr('x'), 10);
    vars.container.y = vars.y.value || parseFloat(elem.attr('y'), 10);
    if (prev) {
      if (vars.shape.accepted.indexOf(shape) >= 0) {
        vars.self.shape(shape);
      }
      if (shape === 'rect') {
        x = parseFloat(prev.attr('x'), 10) || 0;
        y = parseFloat(prev.attr('y'), 10) || 0;
        if (vars.padding.value === false) {
          diff = Math.abs(x - vars.container.x);
          if (diff) {
            vars.self.padding(diff);
          }
        }
        if (!vars.container.x) {
          vars.container.x = x + vars.padding.value;
        }
        if (!vars.container.y) {
          vars.container.y = y + vars.padding.value;
        }
        if (!vars.width.value) {
          width = parseFloat(prev.attr('width' || prev.style('width', 10)));
          vars.self.width(width);
        }
        if (!vars.height.value) {
          height = parseFloat(prev.attr('height' || prev.style('height', 10)));
          vars.self.height(height);
        }
      } else if (shape === 'circle') {
        radius = parseFloat(prev.attr('r'), 10);
        x = parseFloat(prev.attr('cx'), 10) || 0;
        x -= radius;
        y = parseFloat(prev.attr('cy'), 10) || 0;
        y -= radius;
        if (vars.padding.value === false) {
          diff = Math.abs(x - vars.container.x);
          if (diff) {
            vars.self.padding(diff);
          }
        }
        if (!vars.container.x) {
          vars.container.x = x + vars.padding.value;
        }
        if (!vars.container.y) {
          vars.container.y = y + vars.padding.value;
        }
        if (!vars.width.value) {
          vars.self.width(radius * 2, 10);
        }
        if (!vars.height.value) {
          vars.self.height(radius * 2, 10);
        }
      } else {
        if (!vars.width.value) {
          vars.self.width(500);
        }
        if (!vars.height.value) {
          vars.self.height(500);
        }
      }
    }
    if (!vars.container.x) {
      vars.container.x = 0;
    }
    if (!vars.container.y) {
      vars.container.y = 0;
    }
    vars.width.inner = vars.width.value - vars.padding.value * 2;
    vars.height.inner = vars.height.value - vars.padding.value * 2;
    size = elem.attr('font-size') || elem.style('font-size');
    size = parseFloat(size, 10);
    vars.container.fontSize = size;
    vars.container.dy = parseFloat(elem.attr('dy'), 10);
    if (!vars.size.value) {
      if (vars.resize.value) {
        return vars.self.size([4, 80]);
      } else {
        return vars.self.size([size / 2, size]);
      }
    }
  };
}).call(this);
