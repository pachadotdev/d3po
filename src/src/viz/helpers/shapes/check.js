var fetchText = require('../../../core/fetch/text.js'),
  largestRect = require('../../../geom/largestrectangle.js'),
  shapeStyle = require('./style.js');
//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
// Draws "square" and "circle" shapes using svg:rect
//------------------------------------------------------------------------------
module.exports = function(vars, selection, enter, exit) {
  //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // Initialize check scale on enter and exit.
  //----------------------------------------------------------------------------
  function init(paths) {
    paths.attr('transform', 'scale(1)');
  }

  //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // Change scale of check on update.
  //---------------------------------------------------------------------------
  function update(paths) {
    paths.attr('transform', function(d) {
      var smaller_dim = Math.min(d.d3po.width, d.d3po.height);
      var scale = Math.floor(smaller_dim / 16);
      return 'scale(' + scale + ')';
    });
  }

  //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // "paths" Enter
  //----------------------------------------------------------------------------
  enter
    .append('path')
    .attr('class', 'd3po_data')
    .attr(
      'd',
      'M5-6.844L3.594-5.407L-2,0.188l-1.594-1.594L-5-2.844L-7.844,0l1.438,1.406l3,3L-2,5.843l1.406-1.438l7-7L7.844-4L5-6.844z'
    )
    .call(init)
    .call(shapeStyle, vars);

  //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // "paths" Update
  //----------------------------------------------------------------------------
  selection.selectAll('path.d3po_data').data(function(d) {
    return [d];
  });

  if (vars.draw.timing) {
    selection
      .selectAll('path.d3po_data')
      .transition()
      .duration(vars.draw.timing)
      .call(update)
      .call(shapeStyle, vars);
  } else {
    selection
      .selectAll('path.d3po_data')
      .call(update)
      .call(shapeStyle, vars);
  }
};
