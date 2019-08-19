// Corresponds d3 3.x color schemes to d3 5.x ones
(function() {

    var schemes = {},
        dict = {
            "category10": d3.schemeCategory10
        },
        default = "category10";

    schemes.allowedValues = Object.keys(dict)

    schemes.get = function(string) {
        return dict[string] || dict[default];
    };

    module.exports = schemes;

}).call(this);