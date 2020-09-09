HTMLWidgets.widget({

  name: 'd3po',

  type: 'output',

  factory: function(el, width, height) {

    var chart;

    return {

      renderValue: function(x) {

        document.getElementById(el.id).innerHTML = "";
    
        window.x = x;
        window.el = el;
    
        // visualization method
        
        chart = new d3po.viz();
        chart.container("#" + el.id);

        switch (x.type) {
          case "area":
            chart = new d3po.AreaPlot();
            break;
          case "bar":
            chart = new d3po.BarChart();
            break;
          case "box":
            chart = new d3po.BoxWhisker();
            break;
          case "line":
            chart = new d3po.LinePlot();
            break;
          case "scatter":
            chart = new d3po.Plot();
            break;
          case "stacked":
            chart = new d3po.StackedArea();
            break;
          case "treemap":
            chart.type("treemap");
            break;
          default:
            chart = null;
        }
    
        // common arguments
        chart.data(x.data);
        
        if (x.group_by) {
          chart.id(x.group_by);
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
    
        // title, subtitle and footer
        if (x.title) {
          chart.title(x.title);
        }
        
        // title, subtitle and footer
        chart.legend(x.legend);
        
        // aesthetic parameters
        if (x.color) {
          chart.color(x.color);
        }
        
        setTimeout(function() {
          chart.resize(true);
          chart.draw();
        }, 10);

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