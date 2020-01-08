(function() {
  module.exports = function(vars, selection, enter, exit) {
    var d, data, init, marker, orient, pos, position, size, style;
    data = function(d) {
      if (d.d3po.text) {
        d.d3po_label = {
          w: size,
          h: size,
          x: 0,
          y: 0,
          background: '#fff',
          resize: false,
          angle: ['left', 'right'].indexOf(d.d3po.position) >= 0 ? 90 : 0
        };
      } else if (d.d3po.label) {
        d.d3po_label = d.d3po.label;
      } else {
        delete d.d3po_label;
      }
      return [d];
    };
    style = function(line) {
      return line
        .style('stroke-width', vars.data.stroke.width)
        .style('stroke', '#444')
        .attr('fill', 'none')
        .attr('shape-rendering', vars.shape.rendering.value);
    };
    init = function(line) {
      return line
        .attr('x1', 0)
        .attr('x2', 0)
        .attr('y1', 0)
        .attr('y2', 0);
    };
    position = function(line) {
      return line
        .attr('x1', function(d) {
          var offset, w, x;
          if (['top', 'bottom'].indexOf(d.d3po.position) >= 0) {
            return 0;
          } else {
            offset = d.d3po.offset || 0;
            w = d.d3po.width || 0;
            x = offset < 0 ? -w : w;
            return x + offset;
          }
        })
        .attr('x2', function(d) {
          if (['top', 'bottom'].indexOf(d.d3po.position) >= 0) {
            return 0;
          } else {
            return d.d3po.offset || 0;
          }
        })
        .attr('y1', function(d) {
          var h, offset, y;
          if (['left', 'right'].indexOf(d.d3po.position) >= 0) {
            return 0;
          } else {
            offset = d.d3po.offset || 0;
            h = d.d3po.height || 0;
            y = offset < 0 ? -h : h;
            return y + offset;
          }
        })
        .attr('y2', function(d) {
          if (['left', 'right'].indexOf(d.d3po.position) >= 0) {
            return 0;
          } else {
            return d.d3po.offset || 0;
          }
        })
        .attr('marker-start', 'url(#d3po_whisker_marker)');
    };
    marker = vars.defs.selectAll('#d3po_whisker_marker').data([0]);
    marker
      .enter()
      .append('marker')
      .attr('id', 'd3po_whisker_marker')
      .attr('markerUnits', 'userSpaceOnUse')
      .style('overflow', 'visible')
      .append('line');
    d = selection.datum();
    if (d) {
      pos = d.d3po.position;
      orient = ['top', 'bottom'].indexOf(pos) >= 0 ? 'horizontal' : 'vertical';
      size = orient === 'horizontal' ? d.d3po.width : d.d3po.height;
    } else {
      orient = 'horizontal';
      size = 0;
    }
    marker
      .select('line')
      .attr('x1', orient === 'horizontal' ? -size / 2 : 0)
      .attr('x2', orient === 'horizontal' ? size / 2 : 0)
      .attr('y1', orient === 'vertical' ? -size / 2 : 0)
      .attr('y2', orient === 'vertical' ? size / 2 : 0)
      .call(style)
      .style('stroke-width', vars.data.stroke.width * 2);
    if (vars.draw.timing) {
      enter
        .append('line')
        .attr('class', 'd3po_data')
        .call(style)
        .call(init);
      selection
        .selectAll('line.d3po_data')
        .data(data)
        .transition()
        .duration(vars.draw.timing)
        .call(style)
        .call(position);
      exit
        .selectAll('line.d3po_data')
        .transition()
        .duration(vars.draw.timing)
        .call(init);
    } else {
      enter.append('line').attr('class', 'd3po_data');
      selection
        .selectAll('line.d3po_data')
        .data(data)
        .call(style)
        .call(position);
    }
  };
}.call(this));
