(() => {
  let angles;
  let interpolates;
  let radii;
  let shapeStyle;

  shapeStyle = require('./style.js');

  radii = {};

  angles = {};

  interpolates = {
    r: {},
    a: {}
  };

  module.exports = (vars, selection, enter, exit) => {
    let data;
    let newRadial;
    let nextLevel;
    let radial;
    let radialTween;
    nextLevel = vars.id.nesting[vars.depth.value + 1];
    radial = d3.svg.line
      .radial()
      .interpolate('linear-closed')
      .radius(d => d.d3po.r)
      .angle(d => d.d3po.a);
    data = d => {
      if (vars.labels.value) {
        if (d.d3po.label) {
          d.d3po_label = d.d3po.label;
        } else {
          delete d.d3po_label;
        }
      }
      return [d];
    };
    if (vars.draw.timing) {
      selection.each(d => {
        let c;
        let j;
        let len;
        let ref;
        let results;
        ref = d[nextLevel];
        results = [];
        for (j = 0, len = ref.length; j < len; j++) {
          c = ref[j];
          results.push((c.d3po.id = c[vars.id.value] + '_' + c[nextLevel]));
        }
        return results;
      });
      newRadial = d3.svg.line
        .radial()
        .interpolate('linear-closed')
        .radius(d => {
          if (radii[d.d3po.id] === void 0) {
            radii[d.d3po.id] = 0;
          }
          if (isNaN(radii[d.d3po.id])) {
            radii[d.d3po.id] = d.d3po.r;
          }
          return radii[d.d3po.id];
        })
        .angle(d => {
          if (angles[d.d3po.id] === void 0) {
            angles[d.d3po.id] = d.d3po.a;
          }
          if (isNaN(angles[d.d3po.id])) {
            angles[d.d3po.id] = d.d3po.a;
          }
          return angles[d.d3po.id];
        });
      radialTween = (arcs, newRadius) =>
        arcs.attrTween('d', d => {
          let a;
          let c;
          let i;
          let j;
          let len;
          let r;
          let ref;
          ref = d[nextLevel];
          for (i = j = 0, len = ref.length; j < len; i = ++j) {
            c = ref[i];
            a = c.d3po.a;
            if (newRadius === void 0) {
              r = c.d3po.r;
            } else if (newRadius === 0) {
              r = 0;
            }
            interpolates.a[c.d3po.id] = d3.interpolate(angles[c.d3po.id], a);
            interpolates.r[c.d3po.id] = d3.interpolate(radii[c.d3po.id], r);
          }
          return t => {
            let k;
            let len1;
            let ref1;
            ref1 = d[nextLevel];
            for (i = k = 0, len1 = ref1.length; k < len1; i = ++k) {
              c = ref1[i];
              angles[c.d3po.id] = interpolates.a[c.d3po.id](t);
              radii[c.d3po.id] = interpolates.r[c.d3po.id](t);
            }
            return newRadial(d[nextLevel]);
          };
        });
      enter
        .append('path')
        .attr('class', 'd3po_data')
        .call(shapeStyle, vars)
        .attr('d', d => newRadial(d[nextLevel]));
      selection
        .selectAll('path.d3po_data')
        .data(data)
        .transition()
        .duration(vars.draw.timing)
        .call(shapeStyle, vars)
        .call(radialTween);
      exit
        .selectAll('path.d3po_data')
        .transition()
        .duration(vars.draw.timing)
        .call(radialTween, 0);
    } else {
      enter.append('path').attr('class', 'd3po_data');
      selection
        .selectAll('path.d3po_data')
        .data(data)
        .call(shapeStyle, vars)
        .attr('d', d => radial(d[nextLevel]));
    }
  };
}).call(this);
