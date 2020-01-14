(() => {
  let shapeStyle;

  shapeStyle = require('./style.js');

  module.exports = (vars, selection, enter, exit) => {
    let data;
    let init;
    let update;
    data = d => {
      let h;
      let w;
      if (vars.labels.value && !d.d3po.label) {
        w = d.d3po.r ? d.d3po.r * 2 : d.d3po.width;
        h = d.d3po.r ? d.d3po.r * 2 : d.d3po.height;
        d.d3po_label = {
          w: w,
          h: h,
          x: 0,
          y: 0
        };
        d.d3po_share = {
          w: w,
          h: h,
          x: 0,
          y: 0
        };
        d.d3po_label.shape = d.d3po.shape === 'circle' ? 'circle' : 'square';
      } else if (d.d3po.label) {
        d.d3po_label = d.d3po.label;
      } else {
        delete d.d3po_label;
      }
      return [d];
    };
    init = nodes =>
      nodes
        .attr('x', d => {
          if (d.d3po.init && 'x' in d.d3po.init) {
            return d.d3po.init.x;
          } else {
            if (d.d3po.init && 'width' in d.d3po.init) {
              return -d.d3po.width / 2;
            } else {
              return 0;
            }
          }
        })
        .attr('y', d => {
          if (d.d3po.init && 'y' in d.d3po.init) {
            return d.d3po.init.y;
          } else {
            if (d.d3po.init && 'height' in d.d3po.init) {
              return -d.d3po.height / 2;
            } else {
              return 0;
            }
          }
        })
        .attr('width', d => {
          if (d.d3po.init && 'width' in d.d3po.init) {
            return d.d3po.init.width;
          } else {
            return 0;
          }
        })
        .attr('height', d => {
          if (d.d3po.init && 'height' in d.d3po.init) {
            return d.d3po.init.height;
          } else {
            return 0;
          }
        });
    update = nodes =>
      nodes
        .attr('x', d => {
          let w;
          w = d.d3po.r ? d.d3po.r * 2 : d.d3po.width;
          return -w / 2;
        })
        .attr('y', d => {
          let h;
          h = d.d3po.r ? d.d3po.r * 2 : d.d3po.height;
          return -h / 2;
        })
        .attr('width', d => {
          if (d.d3po.r) {
            return d.d3po.r * 2;
          } else {
            return d.d3po.width;
          }
        })
        .attr('height', d => {
          if (d.d3po.r) {
            return d.d3po.r * 2;
          } else {
            return d.d3po.height;
          }
        })
        .attr('rx', d => {
          let rounded;
          let w;
          rounded = d.d3po.shape === 'circle';
          w = d.d3po.r ? d.d3po.r * 2 : d.d3po.width;
          if (rounded) {
            return (w + 2) / 2;
          } else {
            return 0;
          }
        })
        .attr('ry', d => {
          let h;
          let rounded;
          rounded = d.d3po.shape === 'circle';
          h = d.d3po.r ? d.d3po.r * 2 : d.d3po.height;
          if (rounded) {
            return (h + 2) / 2;
          } else {
            return 0;
          }
        })
        .attr('transform', d => {
          if ('rotate' in d.d3po) {
            return 'rotate(' + d.d3po.rotate + ')';
          } else {
            return '';
          }
        })
        .attr('shape-rendering', d => {
          if (d.d3po.shape === 'square' && !('rotate' in d.d3po)) {
            return vars.shape.rendering.value;
          } else {
            return 'auto';
          }
        });
    if (vars.draw.timing) {
      enter
        .append('rect')
        .attr('class', 'd3po_data')
        .call(init)
        .call(shapeStyle, vars);
      selection
        .selectAll('rect.d3po_data')
        .data(data)
        .transition()
        .duration(vars.draw.timing)
        .call(update)
        .call(shapeStyle, vars);
      return exit
        .selectAll('rect.d3po_data')
        .transition()
        .duration(vars.draw.timing)
        .call(init);
    } else {
      enter.append('rect').attr('class', 'd3po_data');
      return selection
        .selectAll('rect.d3po_data')
        .data(data)
        .call(update)
        .call(shapeStyle, vars);
    }
  };
}).call(this);
