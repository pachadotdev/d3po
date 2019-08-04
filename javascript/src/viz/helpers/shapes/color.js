// Returns the correct fill color for a node
(function() {
  var fetchColor, fetchValue, lighter, segments;

  fetchValue = require("../../../core/fetch/value.js");

  fetchColor = require("../../../core/fetch/color.js");

  lighter = require("../../../color/lighter.js");

  segments = require("./segments.js");

  module.exports = function(d, vars, stroke) {
    var active, shape, temp, total;
    shape = d.d3po.shape || vars.shape.value;
    if (vars.shape.value === "line" && shape !== "circle") {
      return "none";
    } else if (vars.shape.value === "area" || shape === "active" || vars.shape.value === "line") {
      return fetchColor(vars, d);
    } else if (shape === "temp") {
      if (stroke) {
        return fetchColor(vars, d);
      } else {
        return "url(#d3po_hatch_" + d.d3po.id + ")";
      }
    } else if (d.d3po["static"]) {
      return lighter(fetchColor(vars, d), .75);
    }
    active = segments(vars, d, "active");
    temp = segments(vars, d, "temp");
    total = segments(vars, d, "total");
    if ((!vars.active.value && !vars.temp.value) || active === true || (active && total && active >= total && !temp) || (active && !total)) {
      return fetchColor(vars, d);
    } else if (vars.active.spotlight.value) {
      return vars.color.missing;
    } else {
      return lighter(fetchColor(vars, d), .75);
    }
  };

}).call(this);
