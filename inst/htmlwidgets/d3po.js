HTMLWidgets.widget({

  name: 'd3po',

  type: 'output',

  factory: function(el, width, height) {

    var chart;

    return {

      renderValue: function(x) {

        document.getElementById(el.id).innerHTML = "";
    
        // visualization method
        chart = new d3po.viz();
        chart.container("#" + el.id);

        // type
        chart.type(x.type);
    
        // add id if data present
        // network may just be constituted of edges
        if(x.data){
          chart.id(x.group);
          chart.data(x.data);
        }
        
        if (x.size) {
          chart.size(x.size);
        }
    
        // bar/line chart
        if (x.x) {
          chart.x(x.x);
        }
        if (x.y) {
          chart.y(x.y);
        }
    
        // title
        if (x.title) {
          chart.title(x.title);
        }
        
        // legend
        if(x.legend === undefined) {
          x.legend = false;
        }
        chart.legend(x.legend);
        
        // aesthetic parameters
        if (x.color) {
          chart.color(x.color);
        }
        
        if (x.labels) {
          chart.labels({"align": x.labels.align, "valign": x.labels.valign});
        }

        if(x.edges)
          chart.edges(x.edges)
        
        chart.draw();

      },

      resize: function(width, height) {

        chart.resize();

      },

      getChart: function(){
        return chart;
      }

    };
  }
});

function get_chart(id){

  var htmlWidgetsObj = HTMLWidgets.find("#" + id);

  var g;

  if (typeof htmlWidgetsObj != 'undefined') {
    g = htmlWidgetsObj.getChart();
  }

  return(g);
}

if (HTMLWidgets.shinyMode) {

  Shiny.addCustomMessageHandler('d3po-title',
    function(msg) {
      var chart = get_chart(msg.id);
      if (typeof chart != 'undefined') {
        chart.title(msg.title);
      }
  });

}
