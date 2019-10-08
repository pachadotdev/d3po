// Corresponds d3 3.x aggregation functions to d3 5.x ones
(function() {

    var aggs = {},
        dict = {
            "sum": d3.sum,
            "min": d3.min,
            "max": d3.max,
            "mean": d3.mean,
            "median": d3.median
        };

    aggs.defaultString = "sum";

    aggs.allowedStrings = Object.keys(dict)

    aggs.fromString = function(string) {
        return dict[string] || dict[aggs.defaultString];
    };

    module.exports = aggs;

}).call(this);