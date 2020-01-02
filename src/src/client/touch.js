// Detects is the current browser supports touch events
(function() {
  module.exports =
    'ontouchstart' in window ||
    (window.DocumentTouch && document instanceof DocumentTouch)
      ? true
      : false;
}.call(this));
