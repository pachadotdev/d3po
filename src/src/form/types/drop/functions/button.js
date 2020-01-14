const copy = require('../../../../util/copy.js');
const events = require('../../../../client/pointer.js');
const form = require('../../../form.js');
const print = require('../../../../core/console/print.js');

//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
// Creates and styles the main drop button.
//------------------------------------------------------------------------------
module.exports = vars => {
  if (!('button' in vars.container)) {
    if (vars.dev.value) {
      print.time('creating main button');
    }

    vars.container.button = form()
      .container(vars.container.ui)
      .type('button')
      .ui({
        margin: 0
      });

    if (vars.dev.value) {
      print.timeEnd('creating main button');
    }
  }

  if (vars.focus.changed || vars.data.changed || vars.depth.changed) {
    let depth = vars.depth.value;

    let buttonData = copy(
      vars.data.value.filter(d => {
        let match = false;
        for (let i = 0; i < vars.id.nesting.length; i++) {
          const level = vars.id.nesting[i];
          match = level in d && d[level] === vars.focus.value;
          if (match) {
            depth = i;
            break;
          }
        }
        return match;
      })[0]
    );

    if (!buttonData) {
      buttonData = vars.container.button.data()[0] || vars.data.viz[0];
    }

    vars.container.button
      .data([buttonData])
      .id(vars.id.nesting)
      .depth(depth);
  }

  const hover = vars.hover.value === true ? vars.focus.value : false;

  vars.container.button
    .draw({
      update: vars.draw.update
    })
    .focus('')
    .font(vars.font)
    .format(vars.format)
    .hover(hover)
    .icon({
      button: vars.icon.drop.value,
      select: vars.icon.drop.value,
      value: vars.icon.value
    })
    .text(vars.text.value)
    .timing({
      ui: vars.draw.timing
    })
    .ui({
      border: vars.ui.border,
      color: vars.ui.color,
      padding: vars.ui.padding.css
    })
    .width(vars.width.value)
    .draw();

  const button = vars.container.button.container(Object).ui;

  vars.margin.top +=
    button.node().offsetHeight || button.node().getBoundingClientRect().height;

  button.on(events.click, () => {
    vars.self.open(!vars.open.value).draw();
  });
};
