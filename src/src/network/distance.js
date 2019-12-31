(function() {
    module.exports = function(n1, n2) {
        var xx, yy;
        if (!(n1 instanceof Array)) {
            n1 = [n1.x, n1.y];
        }
        if (!(n2 instanceof Array)) {
            n2 = [n2.x, n2.y];
        }
        xx = Math.abs(n1[0] - n2[0]);
        yy = Math.abs(n1[1] - n2[1]);
        return Math.sqrt((xx * xx) + (yy * yy));
    };

}).call(this);