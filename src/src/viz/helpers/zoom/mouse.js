(function() {
  var labels, removeTooltip, transform;

  labels = require('./labels.js');

  removeTooltip = require('../../../tooltip/remove.js');

  transform = require('./transform.js');

  module.exports = function(vars) {
    var delay,
      eventType,
      limits,
      scale,
      translate,
      xmax,
      xmin,
      xoffset,
      ymax,
      ymin,
      yoffset;
    eventType = d3.event.sourceEvent ? d3.event.sourceEvent.type : null;
    translate = d3.event.translate;
    scale = d3.event.scale;
    limits = vars.zoom.bounds;
    xoffset = (vars.width.viz - vars.zoom.size.width * scale) / 2;
    xmin = xoffset > 0 ? xoffset : 0;
    xmax = xoffset > 0 ? vars.width.viz - xoffset : vars.width.viz;
    yoffset = (vars.height.viz - vars.zoom.size.height * scale) / 2;
    ymin = yoffset > 0 ? yoffset : 0;
    ymax = yoffset > 0 ? vars.height.viz - yoffset : vars.height.viz;
    if (translate[0] + limits[0][0] * scale > xmin) {
      translate[0] = -limits[0][0] * scale + xmin;
    } else if (translate[0] + limits[1][0] * scale < xmax) {
      translate[0] = xmax - limits[1][0] * scale;
    }
    if (translate[1] + limits[0][1] * scale > ymin) {
      translate[1] = -limits[0][1] * scale + ymin;
    } else if (translate[1] + limits[1][1] * scale < ymax) {
      translate[1] = ymax - limits[1][1] * scale;
    }
    vars.zoom.behavior.translate(translate).scale(scale);
    vars.zoom.translate = translate;
    vars.zoom.scale = scale;
    if (eventType === 'wheel') {
      removeTooltip(vars.type.value);
    }
    if (vars.labels.value || vars.labels.changed) {
      if (eventType === 'wheel') {
        delay = vars.draw.timing ? 100 : 250;
        clearTimeout(vars.zoom.wheel);
        vars.zoom.wheel = setTimeout(function() {
          return labels(vars);
        }, delay);
      } else {
        labels(vars);
      }
    }
    if (eventType === 'dblclick') {
      return transform(vars, vars.timing.transitions);
    } else {
      return transform(vars, 0);
    }
  };
}.call(this));
