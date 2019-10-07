// Finds closest value in array
(function() {
    module.exports = function(arr, value) {
        var closest, i;
        if (value.constructor === String) {
            i = arr.indexOf(value);
            if (i > -1) {
                return arr[i];
            } else {
                return arr[0];
            }
        }
        closest = arr[0];
        arr.forEach(function(p) {
            if (Math.abs(value - p) < Math.abs(value - closest)) {
                return closest = p;
            }
        });
        return closest;
    };

}).call(this);