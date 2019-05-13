HTMLWidgets.widget({

  name: 'd3plus',

  type: 'output',

  initialize: function(el, width, height) {
    return {};
  },

  renderValue: function(el, x, instance) {
    document.getElementById(el.id).innerHTML = "";

    var data = HTMLWidgets.dataframeToD3(x.data) || false;
    var edges = HTMLWidgets.dataframeToD3(x.edges) || false;
    var nodes = HTMLWidgets.dataframeToD3(x.nodes) || false;
    
    console.log(x);
    console.log(data);
    console.log(edges);
    console.log(nodes);

    window.x = x;
    window.el = el;

    var chart = new d3plus.viz();

    switch (x.type) {
      case "tree_map":
        chart.type("tree_map");
        break;
      case "geo_map":
        chart.type("geo_map");
        break;
      case "line":
        chart.type("line");
        break;
      case "scatter":
        chart.type("scatter");
        break;
      case "bar":
        chart.type("bar");
        break;
      case "stacked":
        chart.type("stacked");
        break;
      case "pie":
        chart.type("pie");
        break;
      case "network":
        chart.type("network");
        break;
      case "radar":
        chart.type("radar");
        break;
      case "box":
        chart.type("box");
        break;
      case "scatter":
        chart.type("scatter");
        break;
      case "bubbles":
        chart.type("bubbles");
        break;
      case "rings":
        chart.type("rings");
        break;
      case "sankey":
        chart.type("sankey");
        break;
      default:
        chart = null;
    }

    if (data) {
      chart.data(data);
    }
    if (x.id) {
      chart.id(x.id);
    }
    if (x.size) {
      chart.size(x.size);
    }

    // treemap arguments
    if (x.legend) {
      chart.legend(x.legend);
    }
    if (x.icon) {
      chart.icon(x.icon);
    }
    if (x.color) {
      chart.color(x.color);
    }
    if (x.depth) {
      chart.depth(x.depth);
    }

    if (x.tooltipConfig) {
      chart.tooltipConfig(x.tooltipConfig);
    }
    if (x.labels) {
      chart.labels(x.labels);
    }

    // bar/line chart
    if (x.xaxis) {
      chart.x(x.xaxis);
    }
    if (x.yaxis) {
      chart.y(x.yaxis);
    }

    // network arguments
    if (edges) {
      chart.edges(edges);
    }
    if (nodes) {
      chart.nodes(nodes);
    }
    
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
    
    chart.container("#" + el.id);

    setTimeout(function() {
      chart.resize(true);
      chart.draw();
    }, 10);
  }
  
});
