HTMLWidgets.widget({

  name: 'd3plus',

  type: 'output',

  factory: function(el, width, height) {

    // TODO: define shared variables for this instance

    return {

      renderValue: function(x) {

        document.getElementById(el.id).innerHTML = "";

        var data = HTMLWidgets.dataframeToD3(x.data) || false;
        //var groupBy = x.groupBy || false;
        //var sum = x.sum || false;
        //var legendConfig = x.legendConfig || false;
        //var tooltipConfig = x.tooltipConfig || false;
        
        console.log(x);
        console.log(data);
        
        window.x = x;
        window.el = el;

        var chart = new d3plus.viz();

        switch (x.type){
            case "treemap":
                chart.type("tree_map");
                break;
            case "geomap":
                chart = new d3plus.Geomap();
                break;
            case "line":
                chart = new d3plus.LinePlot();
                break;
            case "point":
                chart = new d3plus.Plot();
                break;
            case "bar":
                chart = new d3plus.BarChart();
                break;
            case "area":
                chart = new d3plus.AreaPlot();
                break;
            default:
                chart = null;
        }
        
        if(data)            { chart.data(data);                     }
        if(x.id)       { chart.id(x.id);             }
        if(x.size)           { chart.size(x.size);                     }
        
        // treemap arguments
        if(x.legend)  { chart.legend(x.legend);   }
        if(x.icon)  { chart.icon(x.icon);   }
        if(x.color)  { chart.color(x.color);   }
        if(x.depth)  { chart.depth(x.depth);   }
        
        if(x.tooltipConfig) { chart.tooltipConfig(x.tooltipConfig); }
        if(x.shapeConfig)   { chart.shapeConfig(x.shapeConfig);     }
        if(x.labels) { chart.labels(x.labels); }
        
        // bar/line arguments
        if(x.xaxis)   { chart.x(x.xaxis);     }
        if(x.yaxis)   { chart.y(x.yaxis);     }
        
        // geomap arguments
        if(x.topojsonId)    { chart.topojsonId(x.topojsonId);       }
        if(x.topojson)      { chart.topojson(x.topojson);           }
                  
        chart.container("#" + el.id);

        setTimeout(function() { chart.draw(); }, 10);
      
      },

      resize: function(width, height) {

        // TODO: code to re-render the widget with a new size

      }

    };
  }
});
