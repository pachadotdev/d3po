(function() {
  var contains, format, list, print;

  contains = require("../../array/contains.js");

  format = require("../../string/format.js");

  list = require("../../string/list.js");

  print = require("../console/print.js");

  module.exports = function(vars, accepted, value, method, text) {
    var a, allowed, app, i, len, recs, str, val;
    if (typeof accepted === "function") {
      accepted = accepted(vars);
    }
    if (!(accepted instanceof Array)) {
      accepted = [accepted];
    }
    allowed = contains(accepted, value);
    if (allowed === false && value !== void 0) {
      recs = [];
      val = JSON.stringify(value);
      if (typeof value !== "string") {
        val = "\"" + val + "\"";
      }
      for (i = 0, len = accepted.length; i < len; i++) {
        a = accepted[i];
        if (typeof a === "string") {
          recs.push("\"" + a + "\"");
        } else if (typeof a === "function") {
          recs.push(a.toString().split("()")[0].substring(9));
        } else if (a === void 0) {
          recs.push("undefined");
        } else {
          recs.push(JSON.stringify(a));
        }
      }
      recs = list(recs, vars.format.locale.value.ui.or);
      if (vars.type && ["mode", "shape"].indexOf(method) >= 0) {
        str = vars.format.locale.value.error.accepted;
        app = vars.format.locale.value.visualization[vars.type.value] || vars.type.value;
        print.warning(format(str, val, method, app, recs), method);
      } else {
        str = vars.format.locale.value.dev.accepted;
        print.warning(format(str, val, text, recs), method);
      }
    }
    return !allowed;
  };

}).call(this);
