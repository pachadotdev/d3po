// Flows the text as a foreign element
(function() {
    module.exports = function(vars) {
        var anchor, color, family, opacity, text;
        text = vars.container.value;
        family = text.attr("font-family") || text.style("font-family");
        anchor = vars.align.value || text.attr("text-anchor") || text.style("text-anchor");
        color = text.attr("fill") || text.style("fill");
        opacity = text.attr("opacity") || text.style("opacity");
        anchor = anchor === "end" ? "right" : (anchor === "middle" ? "center" : "left");
        d3.select(text.node().parentNode).append("foreignObject").attr("width", vars.width.value + "px").attr("height", vars.height.value + "px").attr("x", "0px").attr("y", "0px").append("xhtml:div").style("font-family", family).style("font-size", vars.size.value[1] + "px").style("color", color).style("text-align", anchor).style("opacity", opacity).text(vars.text.current);
    };

}).call(this);