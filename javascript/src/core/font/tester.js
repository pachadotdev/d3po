// Creates an invisible test element to populate
(function() {
    module.exports = function(type) {
        var attrs, styles, tester;
        if (["div", "svg"].indexOf(type) < 0) {
            type = "div";
        }
        styles = {
            position: "absolute",
            left: "-9999px",
            top: "-9999px",
            visibility: "hidden",
            display: "block"
        };
        attrs = type === "div" ? {} : {
            position: "absolute"
        };
        tester = d3.select("body").selectAll(type + ".d3po_tester").data([0]).join(type).classed("d3po_tester", true).styles(styles).attrs(attrs);
        return tester;
    };

}).call(this);