HTMLWidgets.widget({

  name: 'd3po',

  type: 'output',

  factory: function(el, width, height) {

    var chart;

    return {

      renderValue: function(x) {

        document.getElementById(el.id).innerHTML = "";
    
        // Get current container dimensions (in case of resize)
        var currentWidth = el.offsetWidth || width;
        var currentHeight = el.offsetHeight || height;
        
        // Build options object for new d3po API
        var options = {
          width: currentWidth,
          height: currentHeight
        };
        
        // Add x and y if present (for bar, line, area, scatter, box)
        if (x.x) options.x = x.x;
        if (x.y) options.y = x.y;
        
        // Add group for grouping/color
        if (x.group) options.group = x.group;
        
        // Add color
        if (x.color) options.color = x.color;
        
        // Add size
        if (x.size) options.size = x.size;
        
        // Add title
        if (x.title) options.title = x.title;
        
        // Add tooltip
        if (x.tooltip) options.tooltip = x.tooltip;
        
        // Add background
        if (x.background) options.background = x.background;
        
        // Create chart based on type
        var ChartClass;
        switch(x.type) {
          case 'line':
            ChartClass = d3po.LineChart;
            break;
          case 'area':
          case 'stacked':
            ChartClass = d3po.AreaChart;
            if (x.type === 'stacked') options.stacked = true;
            break;
          case 'bar':
            ChartClass = d3po.BarChart;
            break;
          case 'box':
            ChartClass = d3po.BoxPlot;
            break;
          case 'scatter':
            ChartClass = d3po.ScatterPlot;
            break;
          case 'pie':
          case 'donut':
            ChartClass = d3po.PieChart;
            if (x.innerRadius) options.innerRadius = x.innerRadius;
            if (x.startAngle) options.startAngle = x.startAngle;
            if (x.endAngle) options.endAngle = x.endAngle;
            break;
          case 'treemap':
            ChartClass = d3po.Treemap;
            // Convert tiling string to D3 tiling function
            if (x.tiling) {
              switch(x.tiling) {
                case 'squarify':
                  options.tile = d3.treemapSquarify;
                  break;
                case 'binary':
                  options.tile = d3.treemapBinary;
                  break;
                case 'slice':
                  options.tile = d3.treemapSlice;
                  break;
                case 'dice':
                  options.tile = d3.treemapDice;
                  break;
                case 'sliceDice':
                  options.tile = d3.treemapSliceDice;
                  break;
                default:
                  console.warn('Unknown tiling method:', x.tiling, '- using squarify');
                  options.tile = d3.treemapSquarify;
              }
            }
            break;
          case 'network':
            ChartClass = d3po.Network;
            if (x.nodes) options.nodes = x.nodes;
            if (x.edges) options.links = x.edges;
            break;
          case 'geomap':
            ChartClass = d3po.GeoMap;
            if (x.map) options.map = x.map;
            break;
          default:
            console.error('Unknown chart type:', x.type);
            return;
        }
        
        // Create the chart instance
        chart = new ChartClass('#' + el.id, options);
        
        // Set data and render
        if (x.data) {
          chart.setData(x.data).render();
        }
      },

      resize: function(newWidth, newHeight) {
        if (chart && chart.resize) {
          chart.resize(newWidth, newHeight);
        }
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
