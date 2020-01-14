const edges = require('./shapes/edges.js');
const paths = require('./shapes/paths.js');
const flash = require('./ui/message.js');
const focusViz = require('./focus/viz.js');
const methodReset = require('../../core/methods/reset.js');
const print = require('../../core/console/print.js');
const shapeLabels = require('./shapes/labels.js');
const titleCase = require('../../string/title.js');

const bounds = require('./zoom/bounds.js');
const labels = require('./zoom/labels.js');
const mouse = require('./zoom/mouse.js');

//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
// Finalize Visualization
//------------------------------------------------------------------------------
module.exports = vars => {
  // Highlight focus nodes/edges
  if (vars.draw.first) {
    setTimeout(() => {
      focusViz(vars);
    }, vars.draw.timing);
  } else {
    focusViz(vars);
  }

  //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // Zoom to fit bounds, if applicable
  //----------------------------------------------------------------------------
  if (!vars.error.value) {
    const zoom = vars.zoom.viewport || vars.zoom.bounds;
    if (vars.types[vars.type.value].zoom && vars.zoom.value && zoom) {
      if (vars.dev.value) {
        print.time('calculating zoom');
      }

      if (vars.draw.first || vars.zoom.reset) {
        bounds(vars, zoom, 0);
      } else if (
        vars.type.changed ||
        vars.focus.changed ||
        vars.height.changed ||
        vars.width.changed ||
        vars.nodes.changed ||
        vars.legend.changed ||
        vars.timeline.changed ||
        vars.ui.changed
      ) {
        bounds(vars, zoom);
      }

      if (vars.dev.value) {
        print.timeEnd('calculating zoom');
      }
    } else {
      vars.zoom.bounds = [
        [0, 0],
        [vars.width.viz, vars.height.viz]
      ];
      vars.zoom.scale = 1;
      bounds(vars);
    }
  }

  //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // Resize/Reposition Overlay Rect for Mouse events
  //----------------------------------------------------------------------------
  const w = vars.zoom.size ? vars.zoom.size.width : vars.width.viz;

  const h = vars.zoom.size ? vars.zoom.size.height : vars.height.viz;
  const x = vars.zoom.bounds ? vars.zoom.bounds[0][0] : 0;
  const y = vars.zoom.bounds ? vars.zoom.bounds[0][1] : 0;

  vars.g.overlay
    .attr('width', w)
    .attr('height', h)
    .attr('x', x)
    .attr('y', y);

  //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // Create labels
  //----------------------------------------------------------------------------
  if (!vars.error.value) {
    if (vars.draw.update) {
      if (vars.edges.path) {
        paths(vars);
      } else {
        edges(vars);
      }
      // if (vars.draw.timing || (!vars.types[vars.type.value].zoom && !vars.draw.timing)) {
      shapeLabels(vars, 'data');
      if (vars.edges.label && !vars.edges.path) {
        setTimeout(() => {
          shapeLabels(vars, 'edges');
        }, vars.draw.timing + 200);
      }
      // }
    } else if (
      (vars.labels.value || vars.labels.changed) &&
      vars.types[vars.type.value].zoom &&
      vars.zoom.value &&
      vars.draw.timing
    ) {
      setTimeout(() => {
        labels(vars);
      }, vars.draw.timing);
    }
  }

  //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // Check for Errors
  //----------------------------------------------------------------------------
  if (!vars.error.value) {
    let reqs = vars.types[vars.type.value].requirements || [];
    if (!(reqs instanceof Array)) {
      reqs = [reqs];
    }
    var data_req = reqs.indexOf('data') >= 0;
    if (!vars.error.internal) {
      if ((!vars.data.viz || !vars.returned.nodes.length) && data_req) {
        vars.error.internal = vars.format.locale.value.error.data;
      }
    }
  }

  //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // Hide the previous app, if applicable
  //----------------------------------------------------------------------------
  const prev = vars.type.previous;
  if (prev && vars.type.value != prev && vars.g.apps[prev]) {
    if (vars.dev.value) {
      print.time('hiding "' + prev + '"');
    }
    if (vars.draw.timing) {
      vars.g.apps[prev]
        .transition()
        .duration(vars.draw.timing)
        .attr('opacity', 0);
    } else {
      vars.g.apps[prev].attr('opacity', 0);
    }
    if (vars.dev.value) {
      print.timeEnd();
    }
  }

  //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // Show the current app, data, and edges groups
  //----------------------------------------------------------------------------
  if (!vars.error.value) {
    const new_opacity =
      (data_req && vars.data.viz.length === 0) ||
      vars.error.internal ||
      vars.error.value
        ? 0
        : vars.focus.value.length &&
          vars.types[vars.type.value].zoom &&
          vars.zoom.value
          ? 1 - vars.tooltip.curtain.opacity
          : 1;

    const timing = vars.draw.timing;

    vars.group
      .transition()
      .duration(timing)
      .attr('opacity', new_opacity);

    vars.g.data
      .transition()
      .duration(timing)
      .attr('opacity', new_opacity);

    vars.g.edges
      .transition()
      .duration(timing)
      .attr('opacity', new_opacity);
  }

  //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // Display and reset internal_error, if applicable
  //----------------------------------------------------------------------------
  if (vars.error.value) {
    flash(vars, vars.error.value);
  } else if (vars.error.internal) {
    vars.error.internal = titleCase(vars.error.internal);
    print.warning(vars.error.internal);
    flash(vars, vars.error.internal);
    vars.error.internal = null;
  } else {
    flash(vars);
  }

  //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // Unfreeze controls and apply zoom behavior, if applicable
  //----------------------------------------------------------------------------
  setTimeout(() => {
    methodReset(vars);

    if (vars.types[vars.type.value].zoom && vars.zoom.value) {
      vars.g.zoom.datum(vars).call(vars.zoom.behavior.on('zoom', mouse));
      if (!vars.zoom.scroll.value) {
        vars.g.zoom
          .on('mousewheel.zoom', null)
          .on('MozMousePixelScroll.zoom', null)
          .on('wheel.zoom', null);
      }
      if (!vars.zoom.click.value) {
        vars.g.zoom.on('dblclick.zoom', null);
      }
      if (!vars.zoom.pan.value) {
        vars.g.zoom.on('mousedown.zoom', null).on('mousemove.zoom', null);
      }
    } else {
      vars.g.zoom
        .call(vars.zoom.behavior.on('zoom', null))
        .on('dblclick.zoom', null)
        .on('mousedown.zoom', null)
        .on('mousemove.zoom', null)
        .on('mousewheel.zoom', null)
        .on('MozMousePixelScroll.zoom', null)
        .on('touchstart.zoom', null)
        .on('wheel.zoom', null);
    }
  }, vars.draw.timing);
};
