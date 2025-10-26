HTMLWidgets.widget({

  name: 'd3po',

  type: 'output',

  factory: function(el, width, height) {

    var chart;
    // helper to evaluate JS formatter strings (same rules as utils.maybeEvalJSFormatter)
    function _maybeEvalJSFormatter(opt) {
      if (typeof opt === 'function') return opt;
      if (typeof opt !== 'string') return null;
      if (!(opt.indexOf('JS.') === 0 || opt.indexOf('JS(') === 0)) return null;
      var expr;
      if (opt.indexOf('JS.') === 0) {
        expr = opt.slice(3).trim();
      } else {
        var first = opt.indexOf('(');
        var last = opt.lastIndexOf(')');
        if (first >= 0 && last > first) {
          expr = opt.substring(first + 1, last).trim();
        } else {
          expr = opt.slice(3).trim();
        }
      }
      var m = expr.match(/^([A-Za-z0-9_\-]+)\s*\((.*)\)$/);
      if (m) {
        var name = m[1];
        var args = m[2] || '';
        try {
          return new Function('value', 'row', 'return window.d3po.format["' + name + '"](' + args + ');');
        } catch (e) {
          console.warn('d3po: failed compiling simple formatter', opt, e);
          return null;
        }
      }
      try {
        return new Function('value', 'row', 'with (window.d3po) { return (' + expr + '); }');
      } catch (e) {
        console.warn('d3po: failed compiling JS formatter expression:', opt, e);
        return null;
      }
    }

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
        
        // Add subgroup for hierarchical treemaps
        if (x.subgroup) options.subgroup = x.subgroup;
        
        // Add color
        if (x.color) options.color = x.color;
        
        // Add size
        if (x.size) options.size = x.size;
        
        // Add title
        if (x.title) options.title = x.title;
        
  // Add tooltip: prefer explicit `tooltip_template` set by `po_tooltip()`
  // over a `tooltip` aesthetic provided via `daes(tooltip = ...)` so user
  // supplied templates override column-based tooltip fields.
  if (x.tooltip_template) options.tooltip = x.tooltip_template;
  else if (x.tooltip) options.tooltip = x.tooltip;
  // Pass formatted columns and axis labels produced by R (po_format / po_labels)
  if (x.formatted_cols) options.formattedCols = x.formatted_cols;
  if (x.axis_labels) options.axisLabels = x.axis_labels;
        // Axis formatters provided as strings: x.axis_x and x.axis_y (R side will pass axis_x/axis_y)
        if (x.axis_x) {
          var fx = _maybeEvalJSFormatter(x.axis_x);
          if (fx) options.axisFormatters = options.axisFormatters || {}, options.axisFormatters.x = fx;
          else options.axisFormatters = options.axisFormatters || {}, options.axisFormatters.x = null;
        }
        if (x.axis_y) {
          var fy = _maybeEvalJSFormatter(x.axis_y);
          if (fy) options.axisFormatters = options.axisFormatters || {}, options.axisFormatters.y = fy;
          else options.axisFormatters = options.axisFormatters || {}, options.axisFormatters.y = null;
        }
        
        // Add background
        if (x.background) options.background = x.background;

  // Add theme overrides from R (po_theme)
  if (x.theme) options.theme = x.theme;
        
        // Add download option (default true if not specified)
        if (x.download !== undefined) options.download = x.download;
        
        // Add font settings
        if (x.font) {
          if (x.font.family) options.fontFamily = x.font.family;
          if (x.font.size) options.fontSize = x.font.size;
          // Note: font.transform is handled in CSS/text-transform, not in D3po options
        }
        
        // Add labels settings
        if (x.labels) {
          options.labels = x.labels;
        }
        
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
            // Pass stack option from R to JavaScript
            if (x.stack !== undefined) options.stack = x.stack;
            break;
          case 'bar':
            ChartClass = d3po.BarChart;
            // Pass stack option from R to JavaScript
            if (x.stack !== undefined) options.stack = x.stack;
            // Pass sort option if present
            if (x.sort) options.sort = x.sort;
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
            if (x.innerRadius !== undefined) options.innerRadius = x.innerRadius;
            if (x.startAngle !== undefined) options.startAngle = x.startAngle;
            if (x.endAngle !== undefined) options.endAngle = x.endAngle;
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
            if (x.layout) options.layout = x.layout;
            if (x.move !== undefined) options.move = x.move;
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

          // Compatibility shim: if server-side provided formattedCols (for
          // example via po_format(x = toupper(...))), try to replace axis
          // tick text with the formatted strings so the widget shows exactly
          // the R-provided labels even if the minified visualization code
          // hasn't been rebuilt yet.
          try {
            if (options.formattedCols && x.data && x.data.length) {
              var fc = options.formattedCols || {};
              // Determine which field is categorical (x or y)
              var categoryField = null;
              var axisKey = null; // 'x' means bottom axis, 'y' means left axis
              if (options.x && typeof x.data[0][options.x] === 'string') {
                categoryField = options.x; axisKey = 'x';
              } else if (options.y && typeof x.data[0][options.y] === 'string') {
                categoryField = options.y; axisKey = 'y';
              }
              if (categoryField) {
                // Resolve formatted column name conservatively: prefer an exact match
                // for the category field; only use fc.x/fc.y when they refer to the
                // same field as the category axis to avoid replacing categorical
                // labels with formatted numeric values (e.g., mean values).
                var formattedColName = null;
                if (fc[categoryField]) formattedColName = fc[categoryField];
                else if (axisKey === 'x' && fc.x && options.x && options.x === categoryField) formattedColName = fc.x;
                else if (axisKey === 'y' && fc.y && options.y && options.y === categoryField) formattedColName = fc.y;
                if (formattedColName) {
                  var map = {};
                  x.data.forEach(function(r) {
                    if (r[categoryField] !== undefined && r[formattedColName] !== undefined) {
                      map[String(r[categoryField])] = String(r[formattedColName]);
                    }
                  });
                  // Replace tick text nodes where content matches a raw key
                  var ticks = document.getElementById(el.id).querySelectorAll('.tick text');
                  ticks.forEach(function(t) {
                    var txt = t.textContent;
                    if (map[txt]) t.textContent = map[txt];
                  });
                }
              }
            }
          } catch (e) {
            // non-fatal: leave rendering as-is
            console.warn('d3po: failed applying formattedCols shim', e);
          }
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
        chart.setTitle(msg.msg.title);
      }
  });

  // Tooltip proxy: allow updating tooltip option (string or function)
  Shiny.addCustomMessageHandler('d3po-tooltip',
    function(msg) {
      var chart = get_chart(msg.id);
      if (typeof chart != 'undefined') {
        var opt = msg.msg.tooltip;
        // keep raw on chart.tooltip so visualization code can re-evaluate
        chart.tooltip = opt;
        // if chart has setData/render methods, call a re-render when possible
        if (typeof chart.render === 'function') {
          try { chart.render(); } catch (e) { /* ignore render errors */ }
        }
      }
  });

  // Axis proxy: update axis formatters at runtime
  Shiny.addCustomMessageHandler('d3po-axis',
    function(msg) {
      var chart = get_chart(msg.id);
      if (typeof chart != 'undefined') {
        if (msg.msg.x !== undefined) {
          var fx = _maybeEvalJSFormatter(msg.msg.x);
          chart.options.axisFormatters = chart.options.axisFormatters || {};
          chart.options.axisFormatters.x = fx || null;
        }
        if (msg.msg.y !== undefined) {
          var fy = _maybeEvalJSFormatter(msg.msg.y);
          chart.options.axisFormatters = chart.options.axisFormatters || {};
          chart.options.axisFormatters.y = fy || null;
        }
        if (typeof chart.render === 'function') {
          try { chart.render(); } catch (e) { /* ignore render errors */ }
        }
      }
  });

  // Labels proxy: update labels (align/valign), subtitle or title at runtime
  Shiny.addCustomMessageHandler('d3po-labels',
    function(msg) {
      var chart = get_chart(msg.id);
      if (typeof chart != 'undefined') {
        if (msg.msg.align !== undefined) {
          // update labels layout options
          chart.options.labels = chart.options.labels || {};
          chart.options.labels.align = msg.msg.align;
        }
        if (msg.msg.valign !== undefined) chart.options.labels = chart.options.labels || {}, chart.options.labels.valign = msg.msg.valign;
        if (msg.msg.subtitle !== undefined) chart.options.labels = chart.options.labels || {}, chart.options.labels.subtitle = msg.msg.subtitle;
        if (msg.msg.title !== undefined) chart.options.title = msg.msg.title;

        // trigger re-render if possible
        if (typeof chart.render === 'function') {
          try { chart.render(); } catch (e) { /* ignore render errors */ }
        }
      }
  });

  Shiny.addCustomMessageHandler('d3po-download',
    function(msg) {
      var chart = get_chart(msg.id);
      if (typeof chart != 'undefined') {
        chart.setDownload(msg.msg.show);
      }
  });

  // Theme proxy: update explicit theme colors at runtime (po_theme proxy)
  Shiny.addCustomMessageHandler('d3po-theme',
    function(msg) {
      var chart = get_chart(msg.id);
      if (typeof chart != 'undefined') {
        // ensure options.theme exists
        chart.options.theme = chart.options.theme || {};
        if (msg.msg.axis !== undefined) chart.options.theme.axis = msg.msg.axis;
        if (msg.msg.tooltips !== undefined) chart.options.theme.tooltips = msg.msg.tooltips;

        // Try to apply theme immediately using the instance helpers if available
        try {
          if (typeof chart._injectThemeStyles === 'function') chart._injectThemeStyles();
          if (chart.options.theme && chart.options.theme.axis && typeof chart._applyExplicitAxisColors === 'function') chart._applyExplicitAxisColors(chart.options.theme.axis);
          // also set DOM data attributes when possible
          try {
            if (chart.svg && chart.svg.attr) chart.svg.attr('data-d3po-axis', chart.options.theme.axis || null).attr('data-d3po-tooltips', chart.options.theme.tooltips || null);
            if (chart.container && chart.container.setAttribute) {
              chart.container.setAttribute('data-d3po-axis', chart.options.theme.axis || '');
              chart.container.setAttribute('data-d3po-tooltips', chart.options.theme.tooltips || '');
            }
          } catch (e) { /* ignore DOM attribute failures */ }
        } catch (e) {
          // non-fatal
        }
      }
  });

}
