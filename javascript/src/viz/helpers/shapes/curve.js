// Corresponds d3 3.x interpolation modes to d3 5.x curves
(function() {

    module.exports = function(interpolationMode) {
        var curves = {
            "basis": d3.curveBasis,
            "basis-open": d3.curveBasisOpen,
            "cardinal": d3.curveCardinal,
            "cardinal-open": d3.curveCardinalOpen,
            "linear": d3.curveLinear,
            "monotone": d3.curveMonotoneY,
            "step": d3.curveStep,
            "step-before": d3.curveStepBefore,
            "step-after": d3.curveStepAfter,
            "default": d3.curveLinear
        };
        return curves[interpolationMode] || curves["default"];
    };

}).call(this);