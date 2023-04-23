// Create menu to download image
module.exports = function(vars, type) {

  function hover(el) {
    el.on("mouseover", function(){
      d3.select(this).style("background-color", "rgb(214, 214, 214)");
    })
    .on("mouseout", function(){
      d3.select(this).style("background-color", "rgb(244, 244, 244)");
    })
  }

  var styles, saveStyles, menu, downloadDiv, imageDiv;
  var marginTop = vars.margin.top > 30 ? vars.margin.top - 30 : vars.margin.top;

  styles = {
      position: "absolute",
      display: "flex",
      "align-items": "center",
      "justify-content": "center",
      "font-size": "18px",
      "font-family": "sans-serif",
      "color": "rgb(68, 68, 68)",
      "background-color": "rgb(244, 244, 244)",
      "border-radius": "3px",
      "border": "1px solid rgb(144, 144, 144)",
      "height": "30px",
      "padding": "0 5px",
      "z-index": 3000
  };

  menu = vars.container.value.selectAll("div.d3po_menu").data([0])
    .enter().append("div")
    .attr("class", "d3po_menu")
    .attr("name", "download");

  downloadDiv = menu.append("div")
    .style(styles)
    .style("right", vars.margin.right+"px")
    .style("top", marginTop+"px")
    .style("cursor", "pointer")
    .call(hover)
    .on("click", function(){
      if (imageDiv.style("opacity") > 0) {
        imageDiv.transition().duration(100).style("opacity", 0);
      } else {
        imageDiv.transition().duration(100).style("opacity", 1);
      }
    });

  downloadDiv.append("svg")
    .attr("xmlns", "http://www.w3.org/2000/svg")
    .attr("width", 24)
    .attr("height", 24)
    .append("path")
    .attr("d", "M4 7a1 1 0 0 1 1-1h14a1 1 0 1 1 0 2H5a1 1 0 0 1-1-1zm0 5a1 1 0 0 1 1-1h14a1 1 0 1 1 0 2H5a1 1 0 0 1-1-1zm0 5a1 1 0 0 1 1-1h14a1 1 0 1 1 0 2H5a1 1 0 0 1-1-1z")
    .attr("fill", "#0D0D0D")
    .on("click", function(){
      if (imageDiv.style("opacity") > 0) {
        imageDiv.transition().duration(100).style("opacity", 0);
      } else {
        imageDiv.transition().duration(100).style("opacity", 1);
      }
    });

  imageDiv = menu.append("div")
    .style(styles)
    .style("display", "block")
    .style("right", vars.margin.right+"px")
    .style("top", (marginTop + 30)+"px")
    .style("font-size", "12px")
    .style("min-width", "130px")
    .style("height", "auto")
    .style("padding", 0)
    .style("opacity", 0);

  saveStyles = {
    display: "flex",
    "align-items": "center",
    "justify-content": "left",
    "color": "rgb(68, 68, 68)",
    "border-radius": "3px",
    "height": "30px",
    "padding": "0 10px",
  };
    
  imageDiv.append("div")
    .style(saveStyles)
    .style("cursor", "pointer")
    .html('Download SVG vector image')
    .call(hover)
    .on("click", function(){
      var svgData = vars.svg.node().outerHTML;
      var svgBlob = new Blob([svgData], {type:"image/svg+xml;charset=utf-8"});
      var svgUrl = URL.createObjectURL(svgBlob);
      var downloadLink = document.createElement("a");
      downloadLink.href = svgUrl;
      downloadLink.download = "plot.svg";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    });
    
  imageDiv.append("div")
   .style(saveStyles)
   .style("cursor", "pointer")
   .html('Download PNG image')
   .call(hover)
   .on("click", function(){
      var svgData = vars.svg.node().outerHTML;
      var canvas = document.createElement("canvas");
      var svgSize = vars.svg.node().getBoundingClientRect();
      var width = svgSize.width;
      var height = svgSize.height;
      canvas.width = width;
      canvas.height = height;
      var ctx = canvas.getContext("2d");
      var img = document.createElement("img");
      img.setAttribute("src", "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData))));
      img.onload = function() {
        ctx.drawImage(img, 0, 0);
        var pngUrl = canvas.toDataURL("image/png");
        var downloadLink = document.createElement("a");
        downloadLink.href = pngUrl;
        downloadLink.download = "plot.png";
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      };
   });

  return menu;
};
