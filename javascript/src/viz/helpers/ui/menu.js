// Create menu to download image
module.exports = function(type) {
    var styles, menu;
    styles = {
        position: "absolute",
        left: "10px",
        top: "10px",
        display: "block"
    };
    menu = d3.select("body").selectAll("div.d3po_menu").data([0]);
    menu.enter().append("div").attr("class", "d3po_menu").style(styles).text('Save PNG')
      .on("click", function(){
        saveSvgAsPng(document.getElementById('d3po'), "diagram.png")
      });
    return menu;
};
