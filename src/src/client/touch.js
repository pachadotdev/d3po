// Detects is the current browser supports touch events
(() => {
  module.exports =
    'ontouchstart' in window ||
    (window.DocumentTouch && document instanceof DocumentTouch)
      ? true
      : false;
}).call(this);
