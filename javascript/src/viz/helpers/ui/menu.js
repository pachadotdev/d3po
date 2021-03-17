// Create menu to download image
module.exports = function(type) {

      function dataURItoBlob(dataURI) {
          // convert base64 to raw binary data held in a string
          // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
          var byteString = atob(dataURI.split(',')[1]);

          // separate out the mime component
          var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

          // write the bytes of the string to an ArrayBuffer
          var ab = new ArrayBuffer(byteString.length);
          var ia = new Uint8Array(ab);
          for (var i = 0; i < byteString.length; i++) {
              ia[i] = byteString.charCodeAt(i);
          }

          return new Blob([ab], {type: mimeString});
      }

      var styles, copyStyles, menu, downloadDiv, copyDiv;

      styles = {
          position: "absolute",
          display: "flex",
          "align-items": "center",
          "justify-content": "center",
          "font-size": "18px",
          "font-family": "sans-serif",
          "color": "rgb(68, 68, 68)",
          "background-color": "rgb(244, 244, 244)",
          "box-shadow": "rgba(0, 0, 0, 0.25) 0px 1px 3px",
          "border-radius": "3px",
          "height": "40px",
          "padding": "0 10px"
      };

      menu = d3.select("body").selectAll("div.d3po_menu").data([0])
        .enter().append("div")
        .attr("class", "d3po_menu")
        .attr("name", "download");

      downloadDiv = menu.append("div")
        .style(styles)
        .style("right", "10px")
        .style("bottom", "10px")
        .style("min-width", "110px")
        .style("cursor", "pointer")
        .on("click", function(){
          saveSvgAsPng(document.getElementById('d3po'), "diagram.png")
        });

      downloadDiv.append("svg")
        .attr("xmlns", "http://www.w3.org/2000/svg")
        .attr("width", 20)
        .attr("height", 20)
        .append("path")
        .attr("d", "M9.1 12L4.9 7.9c-.5-.5-1.3-.5-1.8 0s-.5 1.3 0 1.8l6.2 6.2c.5.5 1.3.5 1.8 0l6.2-6.2c.5-.5.5-1.3 0-1.8s-1.3-.5-1.8 0L11.6 12V1.2C11.6.6 11 0 10.3 0c-.7 0-1.2.6-1.2 1.2V12zM4 20c-.7 0-1.2-.6-1.2-1.2s.6-1.2 1.2-1.2h12.5c.7 0 1.2.6 1.2 1.2s-.5 1.2-1.2 1.2H4z")
        .attr("fill", "#3e3d40")

      downloadDiv.append("div")
        .style("padding-left", "5px")
        .text("Download")

      copyDiv = menu.append("div")
        .style(styles)
        .style("right", "150px")
        .style("bottom", "10px")
        .style("min-width", "60px")
        .style("cursor", "pointer")
        .on("click", function(){
          svgAsPngUri(document.getElementById("d3po")).then(function(uri){
            let blob = dataURItoBlob(uri);
            navigator.clipboard.write([
                new ClipboardItem({
                    [blob.type]: blob
                })
            ]);
          })
        });

      copyDiv.append("svg")
        .attr("xmlns", "http://www.w3.org/2000/svg")
        .attr("width", 18)
        .attr("height",18)
        .append("path")
        .attr("d", "M14.707 8.293l-3-3A1 1 0 0 0 11 5h-1V4a1 1 0 0 0-.293-.707l-3-3A1 1 0 0 0 6 0H3a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h3v3a2 2 0 0 0 2 2h5a2 2 0 0 0 2-2V9a1 1 0 0 0-.293-.707zM12.586 9H11V7.414zm-5-5H6V2.414zM6 7v2H3V2h2v2.5a.5.5 0 0 0 .5.5H8a2 2 0 0 0-2 2zm2 7V7h2v2.5a.5.5 0 0 0 .5.5H13v4z")
        .attr("fill", "#3e3d40")

      copyDiv.append("div")
        .style("padding-left", "5px")
        .text("Copy")

      return menu;
};
