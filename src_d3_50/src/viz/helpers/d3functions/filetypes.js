// Corresponds d3 3.x file fetching functions to d3 5.x ones
(function() {

    var filetypes = {},
        dict = {
            "json": d3.json,
            "xml": d3.xml,
            "html": d3.html,
            "csv": d3.csv,
            "dsv": d3.dsv,
            "tsv": d3.tsv,
            "txt": d3.text,
            "text": d3.text
        };

    filetypes.defaultString = "json";

    filetypes.allowedStrings = Object.keys(dict)

    filetypes.fromString = function(string) {
        return dict[string] || dict[filetypes.defaultString];
    };

    module.exports = filetypes;

}).call(this);