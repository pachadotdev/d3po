(() => {
  module.exports = {
    accepted: [false, Number, String],
    process: function(value, vars) {
      let d;
      let element;
      let elementTag;
      let elementType;
      let i;
      let j;
      let k;
      let len;
      let len1;
      let ref;
      element = vars.data.element.value;
      if (element && ['string', 'number'].indexOf(typeof value) >= 0) {
        elementTag = element.node().tagName.toLowerCase();
        elementType = element.attr('type');
        if (elementTag === 'select') {
          ref = element.selectAll('option');
          for (i = j = 0, len = ref.length; j < len; i = ++j) {
            d = ref[i];
            if (d && d[vars.id.value] === value) {
              element.node().selectedIndex = i;
            }
          }
        } else if (elementTag === 'input' && elementType === 'radio') {
          for (k = 0, len1 = element.length; k < len1; k++) {
            d = element[k];
            this.checked = d && d[vars.id.value] === value;
          }
        }
      }
      return value;
    },
    value: false
  };
}).call(this);
