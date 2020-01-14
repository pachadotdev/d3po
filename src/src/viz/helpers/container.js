// # If placing into a new container, remove it's contents
// and check text direction.
// Also initialized app width and height.
(() => {
  module.exports = vars => {
    var checkParent, i, len, ref, s;
    vars.container.value.style('position', function() {
      var current, remain;
      current = d3.select(this).style('position');
      remain = ['absolute', 'fixed'].indexOf(current) >= 0;
      if (remain) {
        return current;
      } else {
        return 'relative';
      }
    });
    if (vars.container.changed) {
      vars.container.value.html('');
    }
    ref = ['width', 'height'];
    for (i = 0, len = ref.length; i < len; i++) {
      s = ref[i];
      if (!vars[s].value) {
        checkParent = element => {
          var elem, val;
          if (
            element.tagName === void 0 ||
            ['BODY', 'HTML'].indexOf(element.tagName) >= 0
          ) {
            val = window['inner' + s.charAt(0).toUpperCase() + s.slice(1)];
            elem = document !== element ? d3.select(element) : false;
            if (elem) {
              if (s === 'width') {
                val -= parseFloat(elem.style('margin-left'), 10);
                val -= parseFloat(elem.style('margin-right'), 10);
                val -= parseFloat(elem.style('padding-left'), 10);
                val -= parseFloat(elem.style('padding-right'), 10);
              } else {
                val -= parseFloat(elem.style('margin-top'), 10);
                val -= parseFloat(elem.style('margin-bottom'), 10);
                val -= parseFloat(elem.style('padding-top'), 10);
                val -= parseFloat(elem.style('padding-bottom'), 10);
              }
            }
            return (vars[s].value = val <= 20 ? vars[s].small : val);
          } else {
            val = parseFloat(d3.select(element).style(s), 10);
            if (typeof val === 'number' && val > 0) {
              return (vars[s].value = val);
            } else if (element.tagName !== 'BODY') {
              return checkParent(element.parentNode);
            }
          }
        };
        checkParent(vars.container.value.node());
        if (d3.selectAll('body > *:not(script)').size() === 1) {
          d3.select('body').style('overflow', 'hidden');
        }
      }
    }
    vars.container.value
      .style('width', vars.width.value + 'px')
      .style('height', vars.height.value + 'px');
  };
}).call(this);
