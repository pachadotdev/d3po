// Create menu to download image
module.exports = function(type) {
    var styles, menu;
    styles = {
        position: "absolute",
        right: "10px",
        top: "10px",
        // visibility: "hidden",
        display: "block"
    };
    menu = d3.select("body").selectAll("div.d3po_menu").data([0]);
    menu.enter().append("div").attr("class", "d3po_menu").style(styles)//.text('Save PNG')
      .append("ion-icon")
      .attr("name", "download")
      .style("font-size", "30px")
      .on("click", function(){
        saveSvgAsPng(document.getElementById('d3po'), "diagram.png")
      });
    return menu;
};
