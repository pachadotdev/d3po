// Corresponds d3 3.x aggregation functions to d3 5.x ones
(function() {

    var aggs = {},
        dict = {
            "sum": d3.sum,
            "min": d3.min,
            "max": d3.max,
            "mean": d3.mean,
            "median": d3.median
        },
        default = "sum";

    aggs.defaultString = default;

    aggs.allowedStrings = Object.keys(dict)

    aggs.fromString = function(string) {
        return dict[string] || dict[default];
    };

    module.exports = aggs;

}).call(this);