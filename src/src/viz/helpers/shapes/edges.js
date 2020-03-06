const buckets = require('../../../util/buckets.js');
const offset = require('../../../geom/offset.js');

module.exports = vars => {
  const edges = vars.returned.edges || [];
  const scale = vars.zoom.behavior.scaleExtent()[0];

  if (typeof vars.edges.size.value === 'string') {
    const strokeDomain = d3.extent(edges, e => e[vars.edges.size.value]);

    const maxSize =
      d3.min(vars.returned.nodes || [], n => n.d3po.r) *
      (vars.edges.size.scale * 2);

    vars.edges.scale = d3.scale
      .sqrt()
      .domain(strokeDomain)
      .range([vars.edges.size.min, maxSize * scale]);
  } else {
    const defaultWidth =
      typeof vars.edges.size.value == 'number'
        ? vars.edges.size.value
        : vars.edges.size.min;

    vars.edges.scale = () => defaultWidth;
  }

  const o = vars.edges.opacity.value;
  const o_type = typeof o;

  if (vars.edges.opacity.changed && o_type === 'string') {
    vars.edges.opacity.scale.value
      .domain(d3.extent(edges, d => d[o]))
      .range([vars.edges.opacity.min.value, 1]);
  }

  //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // Initialization of Lines
  //----------------------------------------------------------------------------
  function init(l) {
    l.attr('opacity', 0)
      .style('stroke-width', 0)
      .style('stroke', vars.background.value)
      .style('fill', 'none');
  }

  //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // Styling of Lines
  //----------------------------------------------------------------------------
  function style(edges) {
    const marker = vars.edges.arrows.value;

    edges
      .attr('opacity', d =>
        o_type === 'number'
          ? o
          : o_type === 'function'
          ? o(d, vars)
          : vars.edges.opacity.scale.value(d[o])
      )
      .style('stroke-width', e => vars.edges.scale(e[vars.edges.size.value]))
      .style('stroke', vars.edges.color)
      .attr('marker-start', e => {
        const direction = vars.edges.arrows.direction.value;

        let d;
        if ('bucket' in e.d3po) {
          d = '_' + e.d3po.bucket;
        } else {
          d = '';
        }

        return direction == 'source' && marker
          ? 'url(#d3po_edge_marker_default' + d + ')'
          : 'none';
      })
      .attr('marker-end', e => {
        const direction = vars.edges.arrows.direction.value;

        let d;
        if ('bucket' in e.d3po) {
          d = '_' + e.d3po.bucket;
        } else {
          d = '';
        }

        return direction == 'target' && marker
          ? 'url(#d3po_edge_marker_default' + d + ')'
          : 'none';
      })
      .attr('vector-effect', 'non-scaling-stroke')
      .attr('pointer-events', 'none');
  }

  //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // Positioning of Lines
  //----------------------------------------------------------------------------
  function line(l) {
    l.attr(
      'x1',
      d =>
        d[vars.edges.source].d3po.edges[d[vars.edges.target][vars.id.value]].x
    )
      .attr(
        'y1',
        d =>
          d[vars.edges.source].d3po.edges[d[vars.edges.target][vars.id.value]].y
      )
      .attr(
        'x2',
        d =>
          d[vars.edges.target].d3po.edges[d[vars.edges.source][vars.id.value]].x
      )
      .attr(
        'y2',
        d =>
          d[vars.edges.target].d3po.edges[d[vars.edges.source][vars.id.value]].y
      );
  }

  //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // Positioning of Splines
  //----------------------------------------------------------------------------
  const curve = d3.svg.line().interpolate(vars.edges.interpolate.value);

  function spline(l) {
    l.attr('d', d => curve(d.d3po.spline));
  }

  //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // Calculates and Draws Label for edge
  //----------------------------------------------------------------------------
  function label(d) {
    delete d.d3po_label;

    if (
      vars.g.edges.selectAll('line, path').size() < vars.edges.large &&
      vars.edges.label &&
      d[vars.edges.label]
    ) {
      if ('spline' in d.d3po) {
        var length = this.getTotalLength();
        var center = this.getPointAtLength(length / 2);
        const prev = this.getPointAtLength(length / 2 - length * 0.1);
        const next = this.getPointAtLength(length / 2 + length * 0.1);
        var radians = Math.atan2(next.y - prev.y, next.x - prev.x);
        var angle = radians * (180 / Math.PI);
        var width = length * 0.8;
        var x = center.x;
        var y = center.y;
      } else {
        const source = d[vars.edges.source];
        const target = d[vars.edges.target];

        const start = {
          x: source.d3po.edges[target[vars.id.value]].x,
          y: source.d3po.edges[target[vars.id.value]].y
        };

        const end = {
          x: target.d3po.edges[source[vars.id.value]].x,
          y: target.d3po.edges[source[vars.id.value]].y
        };

        const xdiff = end.x - start.x;
        const ydiff = end.y - start.y;
        center = {
          x: end.x - xdiff / 2,
          y: end.y - ydiff / 2
        };
        radians = Math.atan2(ydiff, xdiff);
        angle = radians * (180 / Math.PI);
        length = Math.sqrt(xdiff * xdiff + ydiff * ydiff);
        width = length;
        x = center.x;
        y = center.y;
      }

      width += vars.labels.padding * 2;

      let m = 0;
      if (vars.edges.arrows.value) {
        m =
          typeof vars.edges.arrows.value === 'number'
            ? vars.edges.arrows.value
            : 8;
        m = m / vars.zoom.behavior.scaleExtent()[1];
        width -= m * 2;
      }

      if (angle < -90 || angle > 90) {
        angle -= 180;
      }

      if (width * vars.zoom.behavior.scaleExtent()[0] > 20) {
        d.d3po_label = {
          x: x,
          y: y,
          translate: {
            x: x,
            y: y
          },
          w: width,
          h: 15 + vars.labels.padding * 2,
          angle: angle,
          anchor: 'middle',
          valign: 'center',
          color: vars.edges.color,
          resize: false,
          names: [vars.format.value(d[vars.edges.label])],
          background: 1
        };
      }
    }
  }

  //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // Enter/update/exit the Arrow Marker
  //----------------------------------------------------------------------------
  const markerData = vars.edges.arrows.value
    ? typeof vars.edges.size.value == 'string'
      ? [
          'default_0',
          'default_1',
          'default_2',
          'highlight_0',
          'highlight_1',
          'highlight_2',
          'focus_0',
          'focus_1',
          'focus_2'
        ]
      : ['default', 'highlight', 'focus']
    : [];

  if (typeof vars.edges.size.value == 'string') {
    const b = buckets(vars.edges.scale.range(), 4);
    var markerSize = [];
    for (let i = 0; i < 3; i++) {
      markerSize.push(b[i + 1] + (b[1] - b[0]) * (i + 2) * 2);
    }
  } else {
    const m =
      typeof vars.edges.arrows.value === 'number' ? vars.edges.arrows.value : 8;

    markerSize =
      typeof vars.edges.size.value === 'number' ? vars.edges.size.value / m : m;
  }

  const marker = vars.defs
    .selectAll('.d3po_edge_marker')
    .data(markerData, String);

  const marker_style = path => {
    path
      .attr('d', id => {
        let depth = id.split('_');

        let m;
        if (depth.length == 2 && vars.edges.scale) {
          depth = parseInt(depth[1]);
          m = markerSize[depth];
        } else {
          m = markerSize;
        }

        if (vars.edges.arrows.direction.value == 'target') {
          return (
            'M 0,-' +
            m / 2 +
            ' L ' +
            m * 0.85 +
            ',0 L 0,' +
            m / 2 +
            ' L 0,-' +
            m / 2
          );
        } else {
          return (
            'M 0,-' +
            m / 2 +
            ' L -' +
            m * 0.85 +
            ',0 L 0,' +
            m / 2 +
            ' L 0,-' +
            m / 2
          );
        }
      })
      .attr('fill', d => {
        const type = d.split('_')[0];

        if (type == 'default') {
          return vars.edges.color;
        } else if (type == 'focus') {
          return vars.color.focus;
        } else {
          return vars.color.primary;
        }
      })
      .attr('transform', 'scale(' + 1 / scale + ')');
  };

  if (vars.draw.timing) {
    marker
      .exit()
      .transition()
      .duration(vars.draw.timing)
      .attr('opacity', 0)
      .remove();

    marker
      .select('path')
      .transition()
      .duration(vars.draw.timing)
      .attr('opacity', 1)
      .call(marker_style);
  } else {
    marker.exit().remove();

    marker
      .select('path')
      .attr('opacity', 1)
      .call(marker_style);
  }

  const opacity = vars.draw.timing ? 0 : 1;
  const enter = marker
    .enter()
    .append('marker')
    .attr('id', d => 'd3po_edge_marker_' + d)
    .attr('class', 'd3po_edge_marker')
    .attr('orient', 'auto')
    .attr('markerUnits', 'userSpaceOnUse')
    .style('overflow', 'visible')
    .append('path')
    .attr('opacity', opacity)
    .attr('vector-effect', 'non-scaling-stroke')
    .call(marker_style);

  if (vars.draw.timing) {
    enter
      .transition()
      .duration(vars.draw.timing)
      .attr('opacity', 1);
  }

  //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // Bind "edges" data to lines in the "edges" group
  //----------------------------------------------------------------------------
  const strokeBuckets =
    typeof vars.edges.size.value == 'string'
      ? buckets(vars.edges.scale.domain(), 4)
      : null;

  const direction = vars.edges.arrows.direction.value;

  const line_data = edges.filter(l => {
    if (!l.d3po) {
      l.d3po = {};
    }

    l.d3po.id =
      'edge_' +
      l[vars.edges.source][vars.id.value] +
      '_' +
      l[vars.edges.target][vars.id.value];

    if (l.d3po.spline !== true) {
      let marker;
      if (strokeBuckets) {
        const size = l[vars.edges.size.value];
        l.d3po.bucket =
          size < strokeBuckets[1] ? 0 : size < strokeBuckets[2] ? 1 : 2;
        marker = (markerSize[l.d3po.bucket] * 0.85) / scale;
      } else {
        delete l.d3po.bucket;
        marker = (markerSize * 0.85) / scale;
      }

      const source = l[vars.edges.source];
      const target = l[vars.edges.target];

      if (!source.d3po || !target.d3po) {
        return false;
      }

      const sourceAngle = Math.atan2(
        source.d3po.y - target.d3po.y,
        source.d3po.x - target.d3po.x
      );

      const targetAngle = Math.atan2(
        target.d3po.y - source.d3po.y,
        target.d3po.x - source.d3po.x
      );

      const sourceRadius =
        direction == 'source' && vars.edges.arrows.value
          ? source.d3po.r + marker
          : source.d3po.r;

      const targetRadius =
        direction == 'target' && vars.edges.arrows.value
          ? target.d3po.r + marker
          : target.d3po.r;

      const sourceOffset = offset(sourceAngle, sourceRadius, vars.shape.value);
      const targetOffset = offset(targetAngle, targetRadius, vars.shape.value);

      if (!('edges' in source.d3po)) {
        source.d3po.edges = {};
      }
      source.d3po.edges[target[vars.id.value]] = {
        x: source.d3po.x - sourceOffset.x,
        y: source.d3po.y - sourceOffset.y
      };

      if (!('edges' in target.d3po)) {
        target.d3po.edges = {};
      }
      target.d3po.edges[source[vars.id.value]] = {
        x: target.d3po.x - targetOffset.x,
        y: target.d3po.y - targetOffset.y
      };

      return true;
    }

    return false;
  });

  const lines = vars.g.edges
    .selectAll('g.d3po_edge_line')
    .data(line_data, d => d.d3po.id);

  const spline_data = edges.filter(l => {
    if (l.d3po.spline) {
      let marker;
      if (strokeBuckets) {
        const size = l[vars.edges.size.value];
        l.d3po.bucket =
          size < strokeBuckets[1] ? 0 : size < strokeBuckets[2] ? 1 : 2;
        marker = (markerSize[l.d3po.bucket] * 0.85) / scale;
      } else {
        delete l.d3po.bucket;
        marker = (markerSize * 0.85) / scale;
      }

      const source = l[vars.edges.source];
      const target = l[vars.edges.target];

      const sourceEdge = source.d3po.edges
        ? source.d3po.edges[target[vars.id.value]] || {}
        : {};

      const targetEdge = target.d3po.edges
        ? target.d3po.edges[source[vars.id.value]] || {}
        : {};

      const sourceMod =
        vars.edges.arrows.value && direction == 'source' ? marker : 0;

      const targetMod =
        vars.edges.arrows.value && direction == 'target' ? marker : 0;

      const angleTweak = 0.1;

      const sourceTweak =
        source.d3po.x > target.d3po.x ? 1 - angleTweak : 1 + angleTweak;

      const targetTweak =
        source.d3po.x > target.d3po.x ? 1 + angleTweak : 1 - angleTweak;

      const sourceAngle =
        typeof sourceEdge.angle === 'number'
          ? sourceEdge.angle
          : Math.atan2(
              source.d3po.y - target.d3po.y,
              source.d3po.x - target.d3po.x
            ) * sourceTweak;

      const sourceOffset = offset(
        sourceAngle,
        source.d3po.r + sourceMod,
        vars.shape.value
      );

      const targetAngle =
        typeof targetEdge.angle === 'number'
          ? targetEdge.angle
          : Math.atan2(
              target.d3po.y - source.d3po.y,
              target.d3po.x - source.d3po.x
            ) * targetTweak;

      const targetOffset = offset(
        targetAngle,
        target.d3po.r + targetMod,
        vars.shape.value
      );

      const start = [
        source.d3po.x - sourceOffset.x,
        source.d3po.y - sourceOffset.y
      ];

      const startOffset = sourceEdge.offset
        ? offset(sourceAngle, sourceEdge.offset)
        : false;

      const startPoint = startOffset
        ? [start[0] - startOffset.x, start[1] - startOffset.y]
        : start;

      const end = [
        target.d3po.x - targetOffset.x,
        target.d3po.y - targetOffset.y
      ];

      const endOffset = targetEdge.offset
        ? offset(targetAngle, targetEdge.offset)
        : false;

      const endPoint = endOffset
        ? [end[0] - endOffset.x, end[1] - endOffset.y]
        : end;

      const xd = endPoint[0] - startPoint[0];
      const yd = endPoint[1] - startPoint[1];

      const sourceDistance =
        typeof sourceEdge.radius === 'number'
          ? sourceEdge.radius
          : Math.sqrt(xd * xd + yd * yd) / 4;

      const targetDistance =
        typeof targetEdge.radius === 'number'
          ? targetEdge.radius
          : Math.sqrt(xd * xd + yd * yd) / 4;

      const startAnchor = offset(
        sourceAngle,
        sourceDistance - source.d3po.r - sourceMod * 2
      );

      const endAnchor = offset(
        targetAngle,
        targetDistance - target.d3po.r - targetMod * 2
      );

      l.d3po.spline = [start, end];

      const testAngle = Math.abs(
        Math.atan2(source.d3po.y - target.d3po.y, source.d3po.x - target.d3po.x)
      ).toFixed(5);

      const testStart = Math.abs(sourceAngle).toFixed(5);
      const testEnd = Math.abs(targetAngle - Math.PI).toFixed(5);

      if (
        testStart !== testEnd ||
        [testStart, testEnd].indexOf(testAngle) < 0
      ) {
        l.d3po.spline.splice(
          1,
          0,
          [startPoint[0] - startAnchor.x, startPoint[1] - startAnchor.y],
          [endPoint[0] - endAnchor.x, endPoint[1] - endAnchor.y]
        );

        if (startOffset) {
          l.d3po.spline.splice(1, 0, startPoint);
        }
        if (endOffset) {
          l.d3po.spline.splice(l.d3po.spline.length - 1, 0, endPoint);
        }
      }

      return true;
    }

    return false;
  });

  const splines = vars.g.edges
    .selectAll('g.d3po_edge_path')
    .data(spline_data, d => d.d3po.id);

  if (vars.draw.timing) {
    lines
      .exit()
      .transition()
      .duration(vars.draw.timing)
      .attr('opacity', 0)
      .remove();

    splines
      .exit()
      .transition()
      .duration(vars.draw.timing)
      .attr('opacity', 0)
      .remove();

    lines
      .selectAll('text.d3po_label, rect.d3po_label_bg')
      .transition()
      .duration(vars.draw.timing / 2)
      .attr('opacity', 0)
      .remove();

    splines
      .selectAll('text.d3po_label, rect.d3po_label_bg')
      .transition()
      .duration(vars.draw.timing / 2)
      .attr('opacity', 0)
      .remove();

    lines
      .selectAll('line')
      .data(d => [d])
      .transition()
      .duration(vars.draw.timing)
      .call(line)
      .call(style)
      .each('end', label);

    splines
      .selectAll('path')
      .data(d => [d])
      .transition()
      .duration(vars.draw.timing)
      .call(spline)
      .call(style)
      .each('end', label);

    lines
      .enter()
      .append('g')
      .attr('class', 'd3po_edge_line')
      .append('line')
      .call(line)
      .call(init)
      .transition()
      .duration(vars.draw.timing)
      .call(style)
      .each('end', label);

    splines
      .enter()
      .append('g')
      .attr('class', 'd3po_edge_path')
      .append('path')
      .call(spline)
      .call(init)
      .transition()
      .duration(vars.draw.timing)
      .call(style)
      .each('end', label);
  } else {
    lines.exit().remove();

    splines.exit().remove();

    lines.selectAll('text.d3po_label, rect.d3po_label_bg').remove();

    splines.selectAll('text.d3po_label, rect.d3po_label_bg').remove();

    lines
      .selectAll('line')
      .data(d => [d])
      .call(line)
      .call(style)
      .call(label);

    splines
      .selectAll('path')
      .data(d => [d])
      .call(spline)
      .call(style)
      .call(label);

    lines
      .enter()
      .append('g')
      .attr('class', 'd3po_edge_line')
      .append('line')
      .call(line)
      .call(init)
      .call(style)
      .call(label);

    splines
      .enter()
      .append('g')
      .attr('class', 'd3po_edge_path')
      .append('path')
      .call(spline)
      .call(init)
      .call(style)
      .call(label);
  }
};
