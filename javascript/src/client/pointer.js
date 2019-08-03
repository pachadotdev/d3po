// Creates custom mouse events based on IE and Touch Devices
(function() {
  var ie, touch;

  ie = require("./ie.js");

  touch = require("./touch.js");

  if (touch) {
    module.exports = {
      click: "touchend",
      down: "touchstart",
      up: "touchend",
      over: ie ? "mouseenter" : "mouseover",
      out: ie ? "mouseleave" : "mouseout",
      move: "mousemove"
    };
  } else {
    module.exports = {
      click: "click",
      down: "mousedown",
      up: "mouseup",
      over: ie ? "mouseenter" : "mouseover",
      out: ie ? "mouseleave" : "mouseout",
      move: "mousemove"
    };
  }

}).call(this);
