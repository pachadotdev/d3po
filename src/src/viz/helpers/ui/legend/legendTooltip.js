const fetchText = require('../../../../core/fetch/text');
const events = require('../../../../client/pointer');
const removeTooltip = require('../../../../tooltip/remove');
const scroll = require('../../../../client/scroll');
const fetchValue = require('../../../../core/fetch/value');
const createTooltip = require('../../tooltip/create');

module.exports = function legendTooltip (keys, vars, square_size, colorKey, colorDepth) {
  keys
    .on(events.over, function(d) {
      d3.select(this).style('cursor', 'pointer');

      const bounds = this.getBoundingClientRect();
      const x = bounds.left + square_size / 2 + scroll.x();
      const y = bounds.top + square_size / 2 + scroll.y() + 5;
      const id = fetchValue(vars, d, colorKey);
      const idIndex = vars.id.nesting.indexOf(colorKey);

      let title;
      if (vars.legend.title.value) {
        title = fetchValue(
          vars,
          d,
          vars.legend.title.value,
          colorDepth
        );
      } else {
        title =
                  idIndex >= 0
                    ? fetchText(vars, d, idIndex)[0]
                    : vars.format.value(
                      fetchValue(vars, d, vars.color.value, colorKey),
                      {
                        key: vars.color.value,
                        vars: vars,
                        data: d
                      }
                    );
      }

      let html;
      let js;
      if (vars.legend.filters.value && !(id instanceof Array)) {
        html = '<div style=\'text-align:center;\'>';
        const loc = vars.format.locale.value;
        html +=
                  '<div class=\'mute\'>' +
                  vars.format.value(loc.method.mute) +
                  '</div>';
        html +=
                  '<div class=\'solo\'>' +
                  vars.format.value(loc.method.solo) +
                  '</div>';
        html += '</div>';
        js = tooltip => {
          const style = {
            border: '1px solid #ccc',
            display: 'inline-block',
            margin: '1px 2px',
            padding: '3px 5px'
          };
          tooltip
            .select('.mute')
            .style(style)
            .on(events.over, function() {
              d3.select(this).style('cursor', 'pointer');
            })
            .on(events.click, () => {
              const mute = vars.id.mute.value;
              vars.history.states.push(() => {
                vars.self
                  .id({
                    mute: mute
                  })
                  .draw();
              });
              vars.self
                .id({
                  mute: id
                })
                .draw();
            });
          tooltip
            .select('.solo')
            .style(style)
            .on(events.over, function() {
              d3.select(this).style('cursor', 'pointer');
            })
            .on(events.click, () => {
              const solo = vars.id.solo.value;
              vars.history.states.push(() => {
                vars.self
                  .id({
                    solo: solo
                  })
                  .draw();
              });
              vars.self
                .id({
                  solo: id
                })
                .draw();
            });
        };
      }

      createTooltip({
        data: d,
        html: html,
        js: js,
        depth: colorDepth,
        footer: false,
        vars: vars,
        x: x,
        y: y,
        mouseevents: this,
        title: title,
        titleOnly: !vars.legend.data.value,
        offset: square_size * 0.4
      });
    })
    .on(events.out, () => {
      removeTooltip(vars.type.value);
    });
};
