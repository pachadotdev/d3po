(function() {
    module.exports = function(data, vars) {
        var depth, max_depth, nextDepth;
        max_depth = vars.id.nesting.length - 1;
        depth = vars.depth.value;
        nextDepth = vars.id.nesting[depth + 1];
        if (vars.types[vars.type.value].nesting === false) {
            return 0;
        } else if ((data.d3po.merged || (nextDepth in data && depth < max_depth)) && (!data || nextDepth in data)) {
            return 1;
        } else if (((depth === max_depth && depth > 0) || (data && nextDepth && (!(nextDepth in data)))) && (vars.small || !vars.tooltip.html.value)) {
            return -1;
        } else {
            return 0;
        }
    };

}).call(this);