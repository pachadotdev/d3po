// Assigns behavior to the user's keyboard for navigation
(() => {
  module.exports = vars =>
    d3.select(window).on('keydown.' + vars.container.id, () => {
      var d,
        data,
        depth,
        hist,
        hover,
        i,
        index,
        j,
        key,
        len,
        matchKey,
        ref,
        solo;
      key = d3.event.keyCode;
      if (vars.open.value || vars.hover.value === true) {
        matchKey = vars.hover.value === true ? 'focus' : 'hover';
        index = false;
        ref = vars.data.filtered;
        for (i = j = 0, len = ref.length; j < len; i = ++j) {
          d = ref[i];
          if (d[vars.id.value] === vars[matchKey].value) {
            index = i;
            break;
          }
        }
        if (
          key === 9 &&
          vars.open.value &&
          (!vars.search.enabled || (vars.search.enabled && !d3.event.shiftKey))
        ) {
          return vars.self
            .open(false)
            .hover(false)
            .draw();
        } else if ([38, 40].indexOf(key) >= 0) {
          if (index === false) {
            index = 0;
          } else if (key === 38) {
            if (vars.open.value) {
              if (index <= 0) {
                index = vars.data.filtered.length - 1;
              } else {
                index -= 1;
              }
            }
          } else if (key === 40) {
            if (vars.open.value) {
              if (index >= vars.data.filtered.length - 1) {
                index = 0;
              } else {
                index += 1;
              }
            }
          }
          if (typeof vars.hover.value !== 'boolean') {
            hover = vars.data.filtered[index][vars.id.value];
          } else {
            hover = vars.focus.value;
          }
          return vars.self
            .hover(hover)
            .open(true)
            .draw();
        } else if (key === 13) {
          if (typeof vars.hover.value !== 'boolean') {
            data = vars.data.filtered.filter(
              f => f[vars.id.value] === vars.hover.value
            )[0];
            depth = vars.depth.value;
            if (
              depth < vars.id.nesting.length - 1 &&
              vars.id.nesting[depth + 1] in data
            ) {
              solo = vars.id.solo.value;
              hist = () =>
                vars.self
                  .depth(depth)
                  .id({
                    solo: solo
                  })
                  .draw();
              vars.history.states.push(hist);
              return vars.self
                .depth(vars.depth.value + 1)
                .id({
                  solo: [vars.hover.value]
                })
                .draw();
            } else {
              return vars.self
                .focus(vars.hover.value)
                .hover(true)
                .draw();
            }
          } else {
            return vars.self
              .hover(vars.focus.value)
              .open(true)
              .draw();
          }
        } else if (key === 27) {
          if (vars.open.value) {
            return vars.self
              .open(false)
              .hover(true)
              .draw();
          } else if (vars.hover.value === true) {
            return vars.self.hover(false).draw();
          }
        }
      }
    });
}).call(this);
