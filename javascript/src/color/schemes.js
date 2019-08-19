// Corresponds d3 3.x color schemes to d3 5.x ones
(function() {

    var schemes = {},
        dict = {
            "category10": d3.schemeCategory10,
            "accent": d3.schemeAccent,
            "dark2": d3.schemeDark2,
            "paired": d3.schemePaired,
            "pastel1": d3.schemePastel1,
            "pastel2": d3.schemePastel2,
            "set1": d3.schemeSet1,
            "set2": d3.schemeSet2,
            "set3": d3.schemeSet3,
            "tableau10": d3.schemeTableau10
        },
        default = "category10";

    schemes.defaultString = default;

    schemes.allowedStrings = Object.keys(dict)

    schemes.fromString = function(string) {
        return dict[string] || dict[default];
    };

    module.exports = schemes;

}).call(this);