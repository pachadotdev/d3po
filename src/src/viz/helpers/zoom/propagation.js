(() => {
  module.exports = (vars, event) => {
    let enabled;
    let zoom;
    let zoomable;
    let zoomed;
    zoom = vars.zoom;
    if (!event) {
      event = d3.event;
    }
    zoomed = zoom.scale > zoom.behavior.scaleExtent()[0];
    enabled =
      vars.types[vars.type.value].zoom && zoom.value && zoom.scroll.value;
    zoomable = event.touches && event.touches.length > 1 && enabled;
    if (!zoomable && !zoomed) {
      event.stopPropagation();
    }
  };
}).call(this);
