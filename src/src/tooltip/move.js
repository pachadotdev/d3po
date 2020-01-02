(function() {
  var arrowStyle, scroll;

  scroll = require('../client/scroll.js');

  module.exports = function(x, y, id) {
    var d, mins, tooltip;
    if (!id) {
      id = 'default';
    }
    tooltip = d3.select('div#d3po_tooltip_id_' + id);
    if (tooltip.node()) {
      d = tooltip.datum();
      d.cx = x;
      d.cy = y;
      if (!d.fixed) {
        if (d.parent.node().tagName.toLowerCase() === 'body') {
          mins = [scroll.x(), scroll.y()];
        } else {
          mins = [0, 0];
        }
        if (d.anchor.y !== 'center') {
          if (d.anchor.x === 'right') {
            d.x = d.cx - d.arrow_offset - 4;
          } else if (d.anchor.x === 'center') {
            d.x = d.cx - d.width / 2;
          } else {
            if (d.anchor.x === 'left') {
              d.x = d.cx - d.width + d.arrow_offset + 2;
            }
          }
          if (d.anchor.y === 'bottom') {
            d.flip = d.cy + d.height + d.offset <= d.limit[1];
          } else {
            if (d.anchor.y === 'top') {
              d.flip = d.cy - d.height - d.offset < mins[1];
            }
          }
          if (d.flip) {
            d.y = d.cy + d.offset + d.arrow_offset;
          } else {
            d.y = d.cy - d.height - d.offset - d.arrow_offset;
          }
        } else {
          d.y = d.cy - d.height / 2;
          if (d.anchor.x === 'right') {
            d.flip = d.cx + d.width + d.offset <= d.limit[0];
          } else {
            if (d.anchor.x === 'left') {
              d.flip = d.cx - d.width - d.offset < mins[0];
            }
          }
          if (d.anchor.x === 'center') {
            d.flip = false;
            d.x = d.cx - d.width / 2;
          } else if (d.flip) {
            d.x = d.cx + d.offset + d.arrow_offset;
          } else {
            d.x = d.cx - d.width - d.offset;
          }
        }
        if (d.x < mins[0]) {
          d.x = mins[0];
        } else {
          if (d.x + d.width > d.limit[0]) {
            d.x = d.limit[0] - d.width;
          }
        }
        if (d.y < mins[1]) {
          d.y = mins[1];
        } else {
          if (d.y + d.height > d.limit[1]) {
            d.y = d.limit[1] - d.height;
          }
        }
      }
      tooltip.style('top', d.y + 'px').style('left', d.x + 'px');
      if (d.arrow) {
        tooltip.selectAll('.d3po_tooltip_arrow').call(arrowStyle);
      }
    }
    return tooltip;
  };

  arrowStyle = function(arrow) {
    return arrow
      .style('bottom', function(d) {
        if (d.anchor.y !== 'center' && !d.flip) {
          return '-5px';
        } else {
          return 'auto';
        }
      })
      .style('right', function(d) {
        if (d.anchor.y === 'center' && !d.flip) {
          return '-5px';
        } else {
          return 'auto';
        }
      })
      .style('top', function(d) {
        if (d.anchor.y !== 'center' && d.flip) {
          return '-5px';
        } else if (d.anchor.y === 'center') {
          return '50%';
        } else {
          return 'auto';
        }
      })
      .style('left', function(d) {
        if (d.anchor.y === 'center' && d.flip) {
          return '-5px';
        } else if (d.anchor.y !== 'center') {
          return '50%';
        } else {
          return 'auto';
        }
      })
      .style('margin-left', function(d) {
        var arrow_x;
        if (d.anchor.y === 'center') {
          return 'auto';
        } else {
          if (d.anchor.x === 'right') {
            arrow_x = -d.width / 2 + d.arrow_offset / 2;
          } else if (d.anchor.x === 'left') {
            arrow_x = d.width / 2 - d.arrow_offset * 2 - 5;
          } else {
            arrow_x = -5;
          }
          if (d.cx - d.width / 2 - 5 < arrow_x) {
            arrow_x = d.cx - d.width / 2 - 5;
            if (arrow_x < 2 - d.width / 2) {
              arrow_x = 2 - d.width / 2;
            }
          } else if (-(d.limit[0] - d.cx - d.width / 2 + 5) > arrow_x) {
            arrow_x = -(d.limit[0] - d.cx - d.width / 2 + 5);
            if (arrow_x > d.width / 2 - 11) {
              arrow_x = d.width / 2 - 11;
            }
          }
          return arrow_x + 'px';
        }
      })
      .style('margin-top', function(d) {
        var arrow_y;
        if (d.anchor.y !== 'center') {
          return 'auto';
        } else {
          if (d.anchor.y === 'bottom') {
            arrow_y = -d.height / 2 + d.arrow_offset / 2 - 1;
          } else if (d.anchor.y === 'top') {
            arrow_y = d.height / 2 - d.arrow_offset * 2 - 2;
          } else {
            arrow_y = -9;
          }
          if (d.cy - d.height / 2 - d.arrow_offset < arrow_y) {
            arrow_y = d.cy - d.height / 2 - d.arrow_offset;
            if (arrow_y < 4 - d.height / 2) {
              arrow_y = 4 - d.height / 2;
            }
          } else if (
            -(d.limit[1] - d.cy - d.height / 2 + d.arrow_offset) > arrow_y
          ) {
            arrow_y = -(d.limit[1] - d.cy - d.height / 2 + d.arrow_offset);
            if (arrow_y > d.height / 2 - 22) {
              arrow_y = d.height / 2 - 22;
            }
          }
          return arrow_y + 'px';
        }
      });
  };
}.call(this));
