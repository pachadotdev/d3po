const copy = require('../../../util/copy.js');
const fetchValue = require('../../../core/fetch/value.js');
const fetchColor = require('../../../core/fetch/color.js');
const fetchText = require('../../../core/fetch/text.js');
const legible = require('../../../color/legible.js');
const mergeObject = require('../../../object/merge.js');
const prefix = require('../../../client/prefix.js');
const stringFormat = require('../../../string/format.js');
const validObject = require('../../../object/validate.js');
//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
// Creates a data object for the Tooltip
//------------------------------------------------------------------------------
module.exports = (vars, id, length, extras, children, depth) => {
  let other_length;
  let extra_data;
  let a;
  if (vars.small) {
    return [];
  }

  if (!length) {
    length = 'long';
  }
  if (length == 'long') {
    other_length = 'short';
  } else {
    other_length = 'long';
  }

  if (extras && typeof extras == 'string') {
    extras = [extras];
  } else if (extras && typeof extras == 'object') {
    extra_data = mergeObject(extra_data, extras);
    extras = [];
    for (const k in extra_data) {
      extras.push(k);
    }
  } else if (!extras) {
    extras = [];
  }

  const tooltip_highlights = [];

  if (vars.tooltip.value instanceof Array) {
    a = vars.tooltip.value;
  } else if (typeof vars.tooltip.value == 'string') {
    a = [vars.tooltip.value];
  } else {
    if (vars.tooltip.value[vars.id.nesting[depth]]) {
      a = vars.tooltip.value[vars.id.nesting[depth]];
    } else {
      a = vars.tooltip.value;
    }

    if (!(a instanceof Array)) {
      if (a[length]) {
        a = a[length];
      } else if (a[other_length]) {
        a = [];
      } else {
        a = mergeObject(
          {
            '': []
          },
          a
        );
      }
    }

    if (typeof a == 'string') {
      a = [a];
    } else if (!(a instanceof Array)) {
      a = mergeObject(
        {
          '': []
        },
        a
      );
    }
  }

  function format_key(key, group) {
    if (vars.attrs.value[group]) {
      var id_var = group;
    } else {
      id_var = null;
    }

    if (group) {
      group = vars.format.value(group);
    }

    let value = extra_data[key] || fetchValue(vars, id, key, id_var);

    if (validObject(value)) {
      tooltip_data.push({
        name: vars.format.value(key),
        value: vars.format.value(value.value, {
          key: value.key,
          vars: vars
        }),
        group: group
      });
    } else if (
      value != null &&
      value != 'undefined' &&
      !(value instanceof Array) &&
      ((typeof value === 'string' && value.indexOf('d3po_other') < 0) ||
        !(typeof value === 'string'))
    ) {
      const name = vars.format.locale.value.ui[key]
        ? vars.format.value(vars.format.locale.value.ui[key])
        : vars.format.value(key);

      const h = tooltip_highlights.indexOf(key) >= 0;

      if (value instanceof Array) {
        value.forEach(v => {
          vars.format.value(v, {
            key: key,
            vars: vars,
            data: id
          });
        });
      } else {
        value = vars.format.value(value, {
          key: key,
          vars: vars,
          data: id
        });
      }

      const obj = {
        name: name,
        value: value,
        highlight: h,
        group: group
      };

      if (vars.descs.value) {
        if (typeof vars.descs.value === 'function') {
          const descReturn = vars.descs.value(key);
          if (typeof descReturn === 'string') {
            obj.desc = descReturn;
          }
        } else if (key in vars.descs.value) {
          obj.desc = vars.descs.value[key];
        }
      }

      tooltip_data.push(obj);
    }
  }

  var tooltip_data = [];
  if (a.constructor === Array) {
    a = {
      '': a
    };
  }

  if (vars.id.nesting.length && depth < vars.id.nesting.length - 1) {
    a = copy(a);
    vars.id.nesting.forEach((n, i) => {
      if (i > depth && a[n]) {
        delete a[n];
      }
    });
  }

  for (var group in a) {
    if (a[group].constructor !== Array) {
      a[group] = [a[group]];
    }
    for (var i = extras.length; i > 0; i--) {
      if (a[group].indexOf(extras[i - 1]) >= 0) {
        extras.splice(i - 1, 1);
      }
    }
  }

  if (vars.tooltip.value.long && typeof vars.tooltip.value.long == 'object') {
    for (group in vars.tooltip.value.long) {
      for (i = extras.length; i > 0; i--) {
        const e = extras[i - 1];
        if (vars.tooltip.value.long[group].indexOf(e) >= 0) {
          if (!a[group]) {
            a[group] = [];
          }
          a[group].push(e);
          extras.splice(i - 1, 1);
        }
      }
    }
  }

  if (extras.length) {
    if (!a['']) {
      a[''] = [];
    }
    a[''] = a[''].concat(extras);
  }

  for (group in a) {
    a[group].forEach(t => {
      format_key(t, group);
    });
  }

  if (children) {
    const title = vars.format.locale.value.ui.including;
    const colors = children.d3po_colors;

    children.values.forEach(child => {
      const name = d3.keys(child)[0];
      tooltip_data.push({
        group: vars.format.value(title),
        highlight: colors && colors[name] ? colors[name] : false,
        name: name,
        value: child[name]
      });
    });

    if (children.d3poMore) {
      tooltip_data.push({
        group: vars.format.value(title),
        highlight: true,
        name: stringFormat(vars.format.locale.value.ui.more, children.d3poMore),
        value: ''
      });
    }
  }

  if (vars.tooltip.connections.value && length === 'long') {
    const connections = vars.edges.connections(
      id[vars.id.value],
      vars.id.value,
      true
    );

    if (connections.length) {
      connections.forEach(conn => {
        let c = vars.data.viz.filter(
          d => d[vars.id.value] === conn[vars.id.value]
        );

        c = c.length ? c[0] : conn;

        const name = fetchText(vars, c)[0];
        const color = fetchColor(vars, c);
        const size = vars.tooltip.font.size;
        const radius = vars.shape.value == 'square' ? 0 : size;
        const styles = [
          'background-color: ' + color,
          'border-color: ' + legible(color),
          'border-style: solid',
          'border-width: ' + vars.data.stroke.width + 'px',
          'display: inline-block',
          'height: ' + size + 'px',
          'left: 0px',
          'position: absolute',
          'width: ' + size + 'px',
          'top: 0px',
          prefix() + 'border-radius: ' + radius + 'px'
        ];
        const node = "<div style='" + styles.join('; ') + ";'></div>";

        const nodeClick = () => {
          vars.self.focus([c[vars.id.value]]).draw();
        };

        tooltip_data.push({
          group: vars.format.value(vars.format.locale.value.ui.primary),
          highlight: false,
          link: nodeClick,
          name:
            "<div id='d3potooltipfocuslink_" +
            c[vars.id.value] +
            "' class='d3po_tooltip_focus_link' style='position:relative;padding-left:" +
            size * 1.5 +
            "px;'>" +
            node +
            name +
            '</div>'
        });
      });
    }
  }

  return tooltip_data;
};
