// Returns appropriate text color based off of a given color
(function() {
  module.exports = function(color) {
    var b, g, r, rgbColor, yiq;
    rgbColor = d3.rgb(color);
    r = rgbColor.r;
    g = rgbColor.g;
    b = rgbColor.b;
    yiq = (r * 299 + g * 587 + b * 114) / 1000;
    if (yiq >= 128) {
      return '#444444';
    } else {
      return '#f7f7f7';
    }
  };
}.call(this));
