const validObject = require('../../../../../../object/validate.js');
const lineStyle = require('./lineStyle');
const lineFont = require('./lineFont');

const ref3 = ['x', 'y', 'x2', 'y2'];

const userLines = (vars, plane) => {
  for (let m = 0, len3 = ref3.length; m < len3; m++) {
    const axis = ref3[m];
    if (vars[axis].value) {
      const lineGroup = plane
        .selectAll('g#d3po_graph_' + axis + '_userlines')
        .data([0]);
      lineGroup
        .enter()
        .append('g')
        .attr('id', 'd3po_graph_' + axis + '_userlines');
      let domain = vars[axis].scale.viz.domain();
      if (axis.indexOf('y') === 0) {
        domain = domain.slice().reverse();
      }
      const textData = [];
      const lineData = [];
      const userLines = vars[axis].lines.value || [];
      for (let n = 0, len4 = userLines.length; n < len4; n++) {
        const line = userLines[n];
        let d = validObject(line) ? line.position : line;
        let valid;
        if (axis === vars.axes.discrete) {
          valid = domain.indexOf(d) >= 0;
        } else {
          valid = d >= domain[0] && d <= domain[1];
        }
        if (valid) {
          d = !validObject(line)
            ? {
              position: d
            }
            : line;
          d.coords = {
            line: vars[axis].scale.viz(d.position)
          };
          lineData.push(d);
          if (d.text) {
            d.axis = axis;
            d.padding = vars[axis].lines.font.padding.value * 0.5;
            d.align = vars[axis].lines.font.align.value;
            const position = vars[axis].lines.font.position.text;
            let textPad = position === 'middle' ? 0 : d.padding * 2;
            if (position === 'top') {
              textPad = -textPad;
            }
            let textPos;
            if (axis.indexOf('x') === 0) {
              textPos =
                d.align === 'left'
                  ? vars.axes.height
                  : d.align === 'center'
                    ? vars.axes.height / 2
                    : 0;
              if (d.align === 'left') {
                textPos -= d.padding * 2;
              }
              if (d.align === 'right') {
                textPos += d.padding * 2;
              }
            } else {
              textPos =
                d.align === 'left'
                  ? 0
                  : d.align === 'center'
                    ? vars.axes.width / 2
                    : vars.axes.width;
              if (d.align === 'right') {
                textPos -= d.padding * 2;
              }
              if (d.align === 'left') {
                textPos += d.padding * 2;
              }
            }
            d.coords.text = {};
            d.coords.text[axis.indexOf('x') === 0 ? 'y' : 'x'] = textPos;
            d.coords.text[axis] = vars[axis].scale.viz(d.position) + textPad;
            d.transform =
              axis.indexOf('x') === 0
                ? 'rotate(-90,' + d.coords.text.x + ',' + d.coords.text.y + ')'
                : null;
            textData.push(d);
          }
        }
      }
      const lines = lineGroup
        .selectAll('line.d3po_graph_' + axis + 'line')
        .data(lineData, d => d.position);
      lines
        .enter()
        .append('line')
        .attr('class', 'd3po_graph_' + axis + 'line')
        .attr('opacity', 0)
        .call(lineStyle, axis, vars);
      lines
        .transition()
        .duration(vars.draw.timing)
        .attr('opacity', 1)
        .call(lineStyle, axis, vars);
      lines
        .exit()
        .transition()
        .duration(vars.draw.timing)
        .attr('opacity', 0)
        .remove();
      const linetexts = lineGroup
        .selectAll('text.d3po_graph_' + axis + 'line_text')
        .data(textData, d => d.position);
      linetexts
        .enter()
        .append('text')
        .attr('class', 'd3po_graph_' + axis + 'line_text')
        .attr('id', d => {
          let id;
          id = d.position + '';
          id = id.replace('-', 'neg');
          id = id.replace('.', 'p');
          return 'd3po_graph_' + axis + 'line_text_' + id;
        })
        .attr('opacity', 0)
        .call(lineFont, axis, vars);
      linetexts
        .text(d => d.text)
        .transition()
        .duration(vars.draw.timing)
        .attr('opacity', 1)
        .call(lineFont, axis, vars);
      linetexts
        .exit()
        .transition()
        .duration(vars.draw.timing)
        .attr('opacity', 0)
        .remove();
      const rectStyle = rect => {
        let getText;
        getText = d => {
          let id;
          id = d.position + '';
          id = id.replace('-', 'neg');
          id = id.replace('.', 'p');
          return plane
            .select('text#d3po_graph_' + d.axis + 'line_text_' + id)
            .node()
            .getBBox();
        };
        return rect
          .attr('x', d => getText(d).x - d.padding)
          .attr('y', d => getText(d).y - d.padding)
          .attr('transform', d => d.transform)
          .attr('width', d => getText(d).width + d.padding * 2)
          .attr('height', d => getText(d).height + d.padding * 2)
          .attr(
            'fill',
            vars.axes.background.color !== 'transparent'
              ? vars.axes.background.color
              : 'white'
          );
      };
      const rectData = vars[axis].lines.font.background.value ? textData : [];
      const lineRects = lineGroup
        .selectAll('rect.d3po_graph_' + axis + 'line_rect')
        .data(rectData, d => d.position);
      lineRects
        .enter()
        .insert('rect', 'text.d3po_graph_' + axis + 'line_text')
        .attr('class', 'd3po_graph_' + axis + 'line_rect')
        .attr('pointer-events', 'none')
        .attr('opacity', 0)
        .call(rectStyle);
      lineRects
        .transition()
        .delay(vars.draw.timing)
        .each('end', function() {
          return d3
            .select(this)
            .transition()
            .duration(vars.draw.timing)
            .attr('opacity', 1)
            .call(rectStyle);
        });
      lineRects
        .exit()
        .transition()
        .duration(vars.draw.timing)
        .attr('opacity', 0)
        .remove();
    }
  }
};
module.exports = userLines;
