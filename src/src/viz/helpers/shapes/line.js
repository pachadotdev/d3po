const copy = require('../../../util/copy.js');
const closest = require('../../../util/closest.js');
const events = require('../../../client/pointer.js');
const shapeStyle = require('./style.js');
const fetchValue = require('../../../core/fetch/value.js');

//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
// Draws "line" shapes using svg:line
//------------------------------------------------------------------------------
module.exports = (vars, selection) => {
  //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // The D3 line function that determines what variables to use for x and y
  // positioning, as well as line interpolation defined by the user.
  //----------------------------------------------------------------------------
  const line = d3.svg
    .line()
    .x(d => d.d3po.x)
    .y(d => d.d3po.y)
    .interpolate(vars.shape.interpolate.value);

  //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // Divide each line into it's segments. We do this so that there can be gaps
  // in the line and mouseover.
  //
  // Then, create new data group from values to become small nodes at each
  // point on the line.
  //----------------------------------------------------------------------------

  const stroke = vars.size.value || vars.data.stroke.width;

  const discrete = vars[vars.axes.discrete];

  const hitarea = l => {
    let s = stroke;
    if (s.constructor !== Number) {
      const v = fetchValue(vars, l, stroke);
      if (v && v.length) {
        s = d3.max(v);
      } else {
        s = vars.data.stroke.width;
      }
    }
    return s < 15 ? 15 : s;
  };

  const ticks = discrete.ticks.values.map(d => {
    if (d.constructor === Date) {
      return d.getTime();
    } else {
      return d;
    }
  });

  selection.each(function(d) {
    let lastIndex = false;
    const segments = [];
    const nodes = [];
    let temp = copy(d);
    const group = d3.select(this);

    temp.values = [];
    temp.segment_key = temp.key;
    d.values.forEach((v, i, arr) => {
      let k = fetchValue(vars, v, discrete.value);

      if (k.constructor === Date) {
        k = k.getTime();
      }

      const index = ticks.indexOf(closest(ticks, k));

      if (lastIndex === false || lastIndex === index - 1) {
        temp.values.push(v);
        temp.segment_key += '_' + index;
      } else {
        if (temp.values.length > 1) {
          segments.push(temp);
        } else {
          nodes.push(temp.values[0]);
        }
        temp = copy(d);
        temp.values = [v];
      }

      if (i === arr.length - 1) {
        if (temp.values.length > 1) {
          segments.push(temp);
        } else {
          nodes.push(temp.values[0]);
        }
      }

      lastIndex = index;
    });

    //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    // Bind segment data to "paths"
    //--------------------------------------------------------------------------
    const paths = group.selectAll('path.d3po_line').data(segments, d => {
      if (!d.d3po) {
        d.d3po = {};
      }
      d.d3po.shape = 'line';
      return d.segment_key;
    });

    //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    // Bind node data to "rects"
    //--------------------------------------------------------------------------
    const rects = group.selectAll('rect.d3po_anchor').data(nodes, d => {
      if (!d.d3po) {
        d.d3po = {};
      }
      d.d3po.r = stroke;
      return d.d3po.id;
    });

    //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    // "paths" and "rects" Enter/Update
    //--------------------------------------------------------------------------
    if (vars.draw.timing) {
      paths
        .exit()
        .transition()
        .duration(vars.draw.timing)
        .attr('opacity', 0)
        .remove();

      paths
        .transition()
        .duration(vars.draw.timing)
        .attr('d', d => line(d.values))
        .call(shapeStyle, vars);

      paths
        .enter()
        .append('path')
        .attr('class', 'd3po_line')
        .style('stroke-linecap', 'round')
        .attr('d', d => line(d.values))
        .call(shapeStyle, vars)
        .attr('opacity', 0)
        .transition()
        .duration(vars.draw.timing)
        .attr('opacity', 1);

      rects
        .enter()
        .append('rect')
        .attr('class', 'd3po_anchor')
        .attr('id', d => d.d3po.id)
        .call(init)
        .call(shapeStyle, vars);

      rects
        .transition()
        .duration(vars.draw.timing)
        .call(update)
        .call(shapeStyle, vars);

      rects
        .exit()
        .transition()
        .duration(vars.draw.timing)
        .call(init)
        .remove();
    } else {
      paths.exit().remove();

      paths
        .enter()
        .append('path')
        .attr('class', 'd3po_line')
        .style('stroke-linecap', 'round');

      paths.attr('d', d => line(d.values)).call(shapeStyle, vars);

      rects
        .enter()
        .append('rect')
        .attr('class', 'd3po_anchor')
        .attr('id', d => d.d3po.id);

      rects.exit().remove();

      rects.call(update).call(shapeStyle, vars);
    }

    //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    // Create mouse event lines
    //--------------------------------------------------------------------------
    const mouse = group
      .selectAll('path.d3po_mouse')
      .data(segments, d => d.segment_key);

    //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    // Mouse "paths" Enter
    //--------------------------------------------------------------------------
    mouse
      .enter()
      .append('path')
      .attr('class', 'd3po_mouse')
      .attr('d', l => line(l.values))
      .style('stroke', 'black')
      .style('stroke-width', hitarea)
      .style('fill', 'none')
      .style('stroke-linecap', 'round')
      .attr('opacity', 0);

    //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    // Mouse "paths" Update
    //--------------------------------------------------------------------------
    mouse
      .on(events.over, function() {
        if (!vars.draw.frozen && vars.mouse.value && vars.mouse.over.value) {
          mouseStyle(vars, this, stroke, 2);
        }
      })
      .on(events.out, function() {
        if (!vars.draw.frozen && vars.mouse.value && vars.mouse.out.value) {
          mouseStyle(vars, this, stroke, 0);
        }
      });

    if (vars.draw.timing) {
      mouse
        .transition()
        .duration(vars.draw.timing)
        .attr('d', l => line(l.values))
        .style('stroke-width', hitarea);
    } else {
      mouse.attr('d', l => line(l.values)).style('stroke-width', hitarea);
    }

    //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    // Mouse "paths" Exit
    //--------------------------------------------------------------------------
    mouse.exit().remove();
  });
};

//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
// The position and size of each anchor point on enter and exit.
//----------------------------------------------------------------------------
function init(n) {
  n.attr('x', d => d.d3po.x)
    .attr('y', d => d.d3po.y)
    .attr('width', 0)
    .attr('height', 0);
}

//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
// The position and size of each anchor point on update.
//----------------------------------------------------------------------------
function update(n, mod) {
  if (mod === undefined) {
    mod = 0;
  }

  n.attr('x', d => {
    const w = d.d3po.r ? d.d3po.r * 2 : d.d3po.width;
    return d.d3po.x - (w / 2 + mod / 2);
  })
    .attr('y', d => {
      const h = d.d3po.r ? d.d3po.r * 2 : d.d3po.height;
      return d.d3po.y - (h / 2 + mod / 2);
    })
    .attr('width', d => {
      const w = d.d3po.r ? d.d3po.r * 2 : d.d3po.width;
      return w + mod;
    })
    .attr('height', d => {
      const h = d.d3po.r ? d.d3po.r * 2 : d.d3po.height;
      return h + mod;
    })
    .attr('rx', d => {
      const w = d.d3po.r ? d.d3po.r * 2 : d.d3po.width;
      return (w + mod) / 2;
    })
    .attr('ry', d => {
      const h = d.d3po.r ? d.d3po.r * 2 : d.d3po.height;
      return (h + mod) / 2;
    });
}

function mouseStyle(vars, elem, stroke, mod) {
  const timing = vars.draw.timing ? vars.timing.mouseevents : 0;
  if (mod === undefined) {
    mod = 0;
  }

  if (timing) {
    d3.select(elem.parentNode)
      .selectAll('path.d3po_line')
      .transition()
      .duration(timing)
      .style('stroke-width', l => {
        let s = stroke;
        if (s.constructor !== Number) {
          const v = fetchValue(vars, l, stroke);
          if (v && v.length) {
            s = d3.max(v);
          } else {
            s = vars.data.stroke.width;
          }
        }
        return s + mod;
      });

    d3.select(elem.parentNode)
      .selectAll('rect')
      .transition()
      .duration(timing)
      .style('stroke-width', l => {
        let s = stroke;
        if (s.constructor !== Number) {
          const v = fetchValue(vars, l, stroke);
          if (v && v.length) {
            s = d3.max(v);
          } else {
            s = vars.data.stroke.width;
          }
        }
        return s;
      })
      .call(update, mod);
  } else {
    d3.select(elem.parentNode)
      .selectAll('path.d3po_line')
      .style('stroke-width', l => {
        let s = stroke;
        if (s.constructor !== Number) {
          const v = fetchValue(vars, l, stroke);
          if (v && v.length) {
            s = d3.max(v);
          } else {
            s = vars.data.stroke.width;
          }
        }
        return s + mod;
      });

    d3.select(elem.parentNode)
      .selectAll('rect')
      .style('stroke-width', l => {
        let s = stroke;
        if (s.constructor !== Number) {
          const v = fetchValue(vars, l, stroke);
          if (v && v.length) {
            s = d3.max(v);
          } else {
            s = vars.data.stroke.width;
          }
        }
        return s;
      })
      .call(update, mod);
  }
}
