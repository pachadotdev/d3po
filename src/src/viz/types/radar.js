(() => {
  let buckets;
  let fetchText;
  let fetchValue;
  let fontSizes;
  let offset;
  let radar;
  let textwrap;
  let uniques;

  fetchText = require('../../core/fetch/text.js');

  fetchValue = require('../../core/fetch/value.js');

  fontSizes = require('../../font/sizes.js');

  offset = require('../../geom/offset.js');

  textwrap = require('../../textwrap/textwrap.js');

  buckets = require('../../util/buckets.js');

  uniques = require('../../util/uniques.js');

  radar = vars => {
    let a;
    let a2;
    let anchor;
    let angle;
    let buffer;
    let c;
    let children;
    let d;
    let data;
    let first;
    let grid;
    let gridStyle;
    let i;
    let idIndex;
    let ids;
    let intervals;
    let j;
    let k;
    let l;
    let labelData;
    let labelGroup;
    let labelHeight;
    let labelIndex;
    let labelStyle;
    let labelWidth;
    let labels;
    let len;
    let len1;
    let len2;
    let len3;
    let m;
    let maxData;
    let maxRadius;
    let n;
    let nextDepth;
    let nextLevel;
    let o;
    let ov;
    let radius;
    let ref;
    let ref1;
    let ringData;
    let ringStyle;
    let rings;
    let second;
    let sizes;
    let text;
    let textStyle;
    let total;
    data = vars.data.viz;
    nextDepth = vars.depth.value + 1;
    nextLevel = vars.id.nesting[nextDepth];
    children = (() => {
      let j;
      let len;
      let results;
      results = [];
      for (j = 0, len = data.length; j < len; j++) {
        d = data[j];
        results.push(d[nextLevel]);
      }
      return results;
    })();
    total = (() => {
      let j;
      let len;
      let results;
      results = [];
      for (j = 0, len = data.length; j < len; j++) {
        d = data[j];
        results.push(uniques(data, nextLevel, fetchValue, vars, nextDepth));
      }
      return results;
    })();
    total = uniques(d3.merge(total)).length;
    angle = (Math.PI * 2) / total;
    maxRadius = d3.min([vars.width.viz, vars.height.viz]) / 2;
    labelHeight = 0;
    labelWidth = 0;
    labels = (() => {
      let j;
      let len;
      let results;
      results = [];
      for (j = 0, len = children.length; j < len; j++) {
        c = children[j];
        results.push(fetchText(vars, c, nextDepth)[0]);
      }
      return results;
    })();
    labels = uniques(d3.merge(labels));
    if (vars.labels.value) {
      first = offset(Math.PI / 2, maxRadius);
      second = offset(angle + Math.PI / 2, maxRadius);
      labelHeight = first.x - second.x - vars.labels.padding * 2;
      textStyle = {
        fill: vars.x.ticks.font.color,
        'font-family': vars.x.ticks.font.family.value,
        'font-weight': vars.x.ticks.font.weight,
        'font-size': vars.x.ticks.font.size + 'px'
      };
      sizes = fontSizes(labels, textStyle, {
        mod: function(elem) {
          return textwrap()
            .container(d3.select(elem))
            .width(vars.height.viz / 8)
            .height(labelHeight)
            .draw();
        }
      });
      labelWidth = d3.max(sizes, d => d.width);
      maxRadius -= labelWidth;
      maxRadius -= vars.labels.padding * 2;
    }
    maxData = (() => {
      let j;
      let len;
      let results;
      results = [];
      for (j = 0, len = children.length; j < len; j++) {
        c = children[j];
        results.push(
          (() => {
            let k;
            let len1;
            let results1;
            results1 = [];
            for (k = 0, len1 = c.length; k < len1; k++) {
              d = c[k];
              results1.push(fetchValue(vars, d, vars.size.value));
            }
            return results1;
          })()
        );
      }
      return results;
    })();
    maxData = d3.max(d3.merge(maxData));
    radius = d3.scale
      .linear()
      .domain([0, maxData])
      .range([0, maxRadius]);
    ids = (() => {
      let j;
      let len;
      let results;
      results = [];
      for (j = 0, len = children.length; j < len; j++) {
        c = children[j];
        results.push(fetchValue(vars, c, nextLevel));
      }
      return results;
    })();
    ids = uniques(d3.merge(ids));
    idIndex = d3.scale
      .ordinal()
      .domain(ids)
      .range(d3.range(0, ids.length));
    for (j = 0, len = data.length; j < len; j++) {
      d = data[j];
      d.d3po.x = vars.width.viz / 2 + vars.margin.top;
      d.d3po.y = vars.height.viz / 2 + vars.margin.left;
      ref = d[nextLevel];
      for (i = k = 0, len1 = ref.length; k < len1; i = ++k) {
        a = ref[i];
        if (!a.d3po) {
          a.d3po = {};
        }
        a.d3po.r = radius(fetchValue(vars, a, vars.size.value));
        a.d3po.a = idIndex(fetchValue(vars, a, nextLevel)) * angle;
      }
    }
    intervals = 1;
    ref1 = [10, 5, 4, 2];
    for (m = 0, len2 = ref1.length; m < len2; m++) {
      i = ref1[m];
      if (maxRadius / i >= 20) {
        intervals = i;
        break;
      }
    }
    ringData = buckets(
      [maxRadius / intervals, maxRadius],
      intervals - 1
    ).reverse();
    if (ringData.length === intervals) {
      ringData.shift();
    }
    rings = vars.group
      .selectAll('.d3po_radar_rings')
      .data(ringData, (d, i) => i);
    ringStyle = ring =>
      ring
        .attr('fill', (d, i) => {
          if (i === 0) {
            return vars.axes.background.color;
          } else {
            return 'transparent';
          }
        })
        .attr('cx', vars.width.viz / 2 + vars.margin.top)
        .attr('cy', vars.height.viz / 2 + vars.margin.left)
        .attr('stroke', vars.x.grid.value ? vars.x.grid.color : 'transparent');
    rings
      .enter()
      .append('circle')
      .attr('class', 'd3po_radar_rings')
      .call(ringStyle)
      .attr('r', 0);
    rings
      .transition()
      .duration(vars.draw.timing)
      .call(ringStyle)
      .attr('r', d => d);
    rings
      .exit()
      .transition()
      .duration(vars.draw.timing)
      .attr('opacity', 0)
      .remove();
    labelIndex = d3.scale
      .ordinal()
      .domain(labels)
      .range(d3.range(0, labels.length));
    labelData = [];
    for (n = 0, len3 = labels.length; n < len3; n++) {
      l = labels[n];
      a2 = angle * labelIndex(l) - Math.PI / 2;
      a = a2 * (180 / Math.PI);
      if (a < -90 || a > 90) {
        a = a - 180;
        buffer = -(maxRadius + vars.labels.padding * 2 + labelWidth);
        anchor = 'end';
      } else {
        buffer = maxRadius + vars.labels.padding * 2;
        anchor = 'start';
      }
      ov = maxRadius;
      if (vars.labels.value) {
        ov += vars.labels.padding;
      }
      o = offset(a2, ov);
      labelData.push({
        text: l,
        angle: a,
        x: buffer,
        anchor: anchor,
        offset: o
      });
    }
    labelGroup = vars.group.selectAll('g.d3po_radar_label_group').data([0]);
    labelGroup
      .enter()
      .append('g')
      .attr('class', 'd3po_radar_label_group')
      .attr(
        'transform',
        'translate(' + vars.width.viz / 2 + ',' + vars.height.viz / 2 + ')'
      );
    labelGroup
      .transition()
      .duration(vars.draw.timing)
      .attr(
        'transform',
        'translate(' + vars.width.viz / 2 + ',' + vars.height.viz / 2 + ')'
      );
    text = labelGroup
      .selectAll('.d3po_radar_labels')
      .data(vars.labels.value ? labelData : [], (d, i) => i);
    labelStyle = label =>
      label
        .attr(textStyle)
        .each(function(l) {
          return textwrap()
            .container(d3.select(this))
            .height(labelHeight)
            .width(labelWidth)
            .align(l.anchor)
            .text(l.text)
            .padding(0)
            .valign('middle')
            .x(l.x)
            .y(-labelHeight / 2)
            .draw();
        })
        .attr('transform', function(t) {
          let translate;
          translate = d3.select(this).attr('transform') || '';
          if (translate.length) {
            translate = translate
              .split(')')
              .slice(-3)
              .join(')');
          }
          return 'rotate(' + t.angle + ')' + translate;
        });
    text.call(labelStyle);
    text
      .enter()
      .append('text')
      .attr('class', 'd3po_radar_labels')
      .attr('opacity', 0)
      .call(labelStyle)
      .transition()
      .duration(vars.draw.timing)
      .attr('opacity', 1);
    text
      .exit()
      .transition()
      .duration(vars.draw.timing)
      .attr('opacity', 0)
      .remove();
    grid = vars.group
      .selectAll('.d3po_radar_lines')
      .data(labelData, (d, i) => i);
    gridStyle = grid =>
      grid
        .attr('stroke', vars.x.grid.color)
        .attr('x1', vars.width.viz / 2 + vars.margin.left)
        .attr('y1', vars.height.viz / 2 + vars.margin.top);
    grid
      .enter()
      .append('line')
      .attr('class', 'd3po_radar_lines')
      .call(gridStyle)
      .attr('x2', vars.width.viz / 2 + vars.margin.left)
      .attr('y2', vars.height.viz / 2 + vars.margin.top);
    grid
      .transition()
      .duration(vars.draw.timing)
      .call(gridStyle)
      .attr('x2', d => vars.width.viz / 2 + vars.margin.left + d.offset.x)
      .attr('y2', d => vars.height.viz / 2 + vars.margin.top + d.offset.y);
    grid
      .exit()
      .transition()
      .duration(vars.draw.timing)
      .attr('opacity', 0)
      .remove();
    vars.mouse.viz = {
      click: false
    };
    return data;
  };

  radar.requirements = ['data', 'size'];

  radar.shapes = ['radial'];

  module.exports = radar;
}).call(this);
