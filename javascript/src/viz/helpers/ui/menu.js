// Create menu to download image
module.exports = function(type) {
    var styles, menu;
    styles = {
        position: "absolute",
        right: "10px",
        bottom: "10px",
        display: "flex",
        "align-items": "center",
        "justify-content": "center"
    };
    menu = d3.select("body").selectAll("div.d3po_menu").data([0]);
    menu.enter().append("div").attr("class", "d3po_menu").style(styles)//.text('Save PNG')
      .text("Download")
      .attr("name", "download")
      .style("font-size", "18px")
      .style("font-family", "sans-serif")
      .style("color", "rgb(68, 68, 68)")
      .style("background-color", "rgb(244, 244, 244)")
      .style("box-shadow", "rgba(0, 0, 0, 0.25) 0px 1px 3px")
      .style("border-radius", "3px")
      .style("height", "40px")
      .style("min-width", "40px")
      .style("padding", "0 10px")
      .style("cursor", "pointer")
      .on("click", function(){
        saveSvgAsPng(document.getElementById('d3po'), "diagram.png")
      });
    return menu;
};
