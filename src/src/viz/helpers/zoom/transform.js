(function() {
    module.exports = function(vars, timing) {
        var translate;
        if (typeof timing !== 'number') {
            timing = vars.timing.transitions;
        }
        translate = 'translate(' + vars.zoom.translate + ')';
        translate += 'scale(' + vars.zoom.scale + ')';
        if (timing) {
            return vars.g.viz
                .transition()
                .duration(timing)
                .attr('transform', translate);
        } else {
            return vars.g.viz.attr('transform', translate);
        }
    };
}.call(this));
