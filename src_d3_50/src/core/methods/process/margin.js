(function() {
    module.exports = function(value, self) {
        var i, j, k, l, len, len1, len2, len3, m, results, side, sides, v;
        if (typeof value === "string") {
            value = value.split(" ");
            for (i = j = 0, len = value.length; j < len; i = ++j) {
                v = value[i];
                value[i] = parseFloat(v, 10);
            }
            if (value.length === 1) {
                value = value[0];
            } else if (value.length === 2) {
                value = {
                    top: value[0],
                    right: value[1],
                    bottom: value[0],
                    left: value[1]
                };
            } else if (value.length === 3) {
                value = {
                    top: value[0],
                    right: value[1],
                    bottom: value[2],
                    left: value[1]
                };
            } else if (value.length === 4) {
                value = {
                    top: value[0],
                    right: value[1],
                    bottom: value[2],
                    left: value[3]
                };
            } else {
                value = 0;
            }
        }
        sides = ["top", "right", "bottom", "left"];
        if (typeof value === "number") {
            for (k = 0, len1 = sides.length; k < len1; k++) {
                side = sides[k];
                self[side] = value;
            }
        } else {
            for (l = 0, len2 = sides.length; l < len2; l++) {
                side = sides[l];
                self[side] = value[side];
            }
        }
        self.css = "";
        results = [];
        for (i = m = 0, len3 = sides.length; m < len3; i = ++m) {
            side = sides[i];
            if (i) {
                self.css += " ";
            }
            results.push(self.css += self[side] + "px");
        }
        return results;
    };

}).call(this);