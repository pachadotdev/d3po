// Darkens a color if it's too light to appear on white
(function() {
    module.exports = function(color) {
        var hsl;
        hsl = d3.hsl(color);
        if (hsl.l > 0.45) {
            if (hsl.s > 0.8) {
                hsl.s = 0.8;
            }
            hsl.l = 0.45;
        }
        return hsl.toString();
    };
}.call(this));
