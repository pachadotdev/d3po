(function() {
    var colorSort;

    colorSort = require('../color/sort.js');

    module.exports = function(a, b, keys, sort, colors, vars, depth) {
        var i, k, retVal;
        if (!sort) {
            sort = 'asc';
        }
        if (!(colors instanceof Array)) {
            colors = [colors];
        }
        if (!(keys instanceof Array)) {
            keys = [keys];
        }
        if (vars && depth !== void 0 && typeof depth !== 'number') {
            depth = vars.id.nesting.indexOf(depth);
        }
        retVal = 0;
        i = 0;
        while (i < keys.length) {
            k = keys[i];
            a = vars && a.d3po && a.d3po.sortKeys ? a.d3po.sortKeys[k] : a[k];
            b = vars && b.d3po && b.d3po.sortKeys ? b.d3po.sortKeys[k] : b[k];
            if (vars && colors.indexOf(k) >= 0) {
                retVal = colorSort(a, b);
            } else {
                retVal = a < b ? -1 : 1;
            }
            if (retVal !== 0 || i === keys.length - 1) {
                break;
            }
            i++;
        }
        if (sort === 'asc') {
            return retVal;
        } else {
            return -retVal;
        }
    };
}.call(this));
