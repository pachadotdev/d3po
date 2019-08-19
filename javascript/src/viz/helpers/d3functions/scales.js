// Corresponds d3 3.x scales to d3 5.x ones
(function() {

    var scales = {},
        dict = {
            "linear": d3.scaleLinear,
            "sqrt": d3.scaleSqrt,
            "pow": d3.scalePow,
            "log": d3.scaleLog,
            "quantize": d3.scaleQuantize,
            "threshold": d3.scaleThreshold,
            "quantile": d3.scaleQuantile,
            "identity": d3.scaleIdentity,
            "ordinal": d3.scaleOrdinal
        };

    scales.defaultString = "linear";

    scales.allowedStrings = Object.keys(dict)

    scales.fromString = function(string) {
        return dict[string] || dict[scales.defaultString];
    };

    module.exports = scales;

}).call(this);