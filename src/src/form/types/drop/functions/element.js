// Overrides keyboard behavior of the original input element
(function() {
  module.exports = function(vars) {
    if (vars.data.element.value) {
      vars.data.element.value.on('focus.' + vars.container.id, function() {
        return vars.self.hover(true).draw();
      });
      vars.data.element.value.on('blur.' + vars.container.id, function() {
        var search;
        if (vars.search.enabled) {
          search =
            d3.event.relatedTarget !==
            vars.container.value.select('input').node();
        } else {
          search = true;
        }
        if (search) {
          return vars.self
            .open(false)
            .hover(false)
            .draw();
        }
      });
      vars.data.element.value.on('change.' + vars.container.id, function() {
        return vars.self.focus(this.value).draw();
      });
      return vars.data.element.value.on(
        'keydown.cancel_' + vars.container.id,
        function() {
          if (d3.event.keyCode !== 9) {
            return d3.event.preventDefault();
          }
        }
      );
    }
  };
}.call(this));
