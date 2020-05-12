HTMLWidgets.widget({

  name: 'd3po',

  type: 'output',

  factory: function(el, width, height) {

    var chart;

    return {

      renderValue: function(x) {

        document.getElementById(el.id).innerHTML = "";

        var edges = HTMLWidgets.dataframeToD3(x.edges) || false;
        var nodes = HTMLWidgets.dataframeToD3(x.nodes) || false;
    
        window.x = x;
        window.el = el;
    
        // visualization method
        
        var chart;
        
        switch (x.type) {
          case "bar":
            chart = new d3po.BarChart();
            break;
          case "box":
            chart = new d3po.BoxWhisker();
            break;
          case "bubbles":
            chart = new d3po.Pack();
            break;
          case "donut":
            chart = new d3po.Donut();
            break;
          case "geomap":
            chart = new d3po.Geomap();
            break;
          case "line":
            chart = new d3po.LinePlot();
            break;
          case "network":
            chart = new d3po.Network();
            break;
          case "pie":
            chart = new d3po.Pie();
            break;
          case "radar":
            chart.type("radar");
            break;
          case "rings":
            chart.type("rings");
            break;
          case "sankey":
            chart.type("sankey");
            break;
          case "scatter":
            chart = new d3po.Plot();
            break;
          case "stacked":
            chart = new d3po.StackedArea();
            break;
          case "treemap":
            chart = new d3po.Treemap();
            break;
          default:
            chart = null;
        }
    
        // common arguments
        chart.data(x.data);
        
        if (x.group_by) {
          chart.groupBy(x.group_by);
        }
        if (x.sum) {
          chart.sum(x.sum);
        }
    
        // treemap specific arguments
        if (x.legend) {
          chart.legend(x.legend);
        }
        if (x.icon) {
          chart.shapeConfig({
            backgroundImage: function(x) { return x.icon; },
            height: 25,
            width: 25
          });
        }
    
        // bar/line chart
        if (x.xaxis) {
          chart.x(x.xaxis);
        }
        if (x.yaxis) {
          chart.y(x.yaxis);
        }
    
        // network arguments
        // if (edges) {
        //   chart.edges(edges);
        // }
        // if (nodes) {
        //  chart.nodes(nodes);
        // }
        
        // geomap arguments
        if (x.coords) {
          chart.coords(x.coords);
        }
        if (x.text) {
          chart.text(x.text);
        }
        
        // rings arguments
        if (x.focus) {
          chart.focus(x.focus);
        }
    
        // title, subtitle and footer
        if (x.title) {
          chart.title(x.title);
        }
        if (x.footer) {
          chart.footer(x.footer);
        }
        
        // aesthetic parameters
        if (x.color) {
          chart.color(x.color);
        }
        if (x.depth) {
          chart.depth(x.depth);
        }
        if (x.font) {
          chart.font(x.font);
        }
        if (x.labels) {
          chart.labels(x.labels);
        }
        if (x.tooltipConfig) {
          chart.tooltipConfig(x.tooltipConfig);
        }
        
        // background
        if (x.background) {
          chart.background(x.background);
        }
    
        setTimeout(function() {
          // chart.resize(true);
          chart.render();
        }, 10);

      },

      resize: function(width, height) {

        // TODO: code to re-render the widget with a new size

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