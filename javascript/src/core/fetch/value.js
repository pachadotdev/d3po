// Finds a given variable by searching through the data and attrs
(function() {
  var cacheInit, checkAttrs, checkData, fetch, fetchArray, filterArray, find, uniqueValues, validObject, valueParse;

  validObject = require("../../object/validate.js");

  uniqueValues = require("../../util/uniques.coffee");

  find = function(vars, node, variable, depth) {
    var cache, nodeObject, returned, val;
    nodeObject = validObject(node);
    if (typeof variable === "function" && nodeObject) {
      return variable(node, vars);
    }
    if (nodeObject) {
      if (variable in node) {
        return node[variable];
      }
      cache = vars.data.cacheID + "_" + depth;
      cacheInit(node, cache, vars);
      if (variable in node.d3po.data[cache]) {
        return node.d3po.data[cache][variable];
      }
      if (depth in node) {
        node = node[depth];
      } else if (vars.id.value in node) {
        node = node[vars.id.value];
        if (depth !== variable) {
          returned = checkData(vars, node, depth, vars.id.value);
        }
        if (returned === null || returned === void 0) {
          returned = checkAttrs(vars, node, depth, vars.id.value);
        }
        if (returned === null || returned === void 0) {
          return null;
        } else if (depth === variable) {
          return returned;
        }
        node = returned;
      } else {
        return null;
      }
    }
    if (node instanceof Array && !validObject(node[0])) {
      node = uniqueValues(node);
    }
    if (node instanceof Array && validObject(node[0])) {
      val = uniqueValues(node, variable);
      if (val.length) {
        return val;
      }
    }
    val = checkData(vars, node, variable, depth);
    if (val) {
      return val;
    }
    val = checkAttrs(vars, node, variable, depth);
    return val;
  };

  checkData = function(vars, node, variable, depth) {
    var val;
    if (vars.data.viz instanceof Array && variable in vars.data.keys) {
      val = uniqueValues(filterArray(vars.data.viz, node, depth), variable);
    }
    if (val && val.length) {
      return val;
    } else {
      return null;
    }
  };

  checkAttrs = function(vars, node, variable, depth) {
    var attrList, n, val, vals;
    if ("attrs" in vars && vars.attrs.value && variable in vars.attrs.keys) {
      if (validObject(vars.attrs.value) && depth in vars.attrs.value) {
        attrList = vars.attrs.value[depth];
      } else {
        attrList = vars.attrs.value;
      }
      if (attrList instanceof Array) {
        val = uniqueValues(filterArray(attrList, node, depth), variable);
        if (val.length) {
          return val;
        }
      } else if (node instanceof Array) {
        attrList = [
          (function() {
            var j, len, results;
            if (n in attrList) {
              results = [];
              for (j = 0, len = node.length; j < len; j++) {
                n = node[j];
                results.push(attrList[n]);
              }
              return results;
            }
          })()
        ];
        if (attrList.length) {
          vals = uniqueValues(attrList, variable);
          if (vals.length) {
            return vals;
          }
        }
      } else if (node in attrList) {
        return attrList[node][variable];
      }
    }
    return null;
  };

  filterArray = function(arr, node, depth) {
    if (node instanceof Array) {
      return arr.filter(function(d) {
        return node.indexOf(d[depth]) >= 0;
      });
    } else {
      return arr.filter(function(d) {
        return d[depth] === node;
      });
    }
  };

  cacheInit = function(node, cache, vars) {
    if (!("d3po" in node)) {
      node.d3po = {};
    }
    if (!("data" in node.d3po)) {
      node.d3po.data = {};
    }
    if (vars.data.changed || (vars.attrs && vars.attrs.changed) || !(cache in node.d3po.data)) {
      node.d3po.data[cache] = {};
    }
    return node;
  };

  valueParse = function(vars, node, depth, variable, val) {
    var cache, d, i, j, len, timeVar, v;
    if (val === null) {
      return val;
    }
    timeVar = "time" in vars && vars.time.value === variable;
    if (!(val instanceof Array)) {
      val = [val];
    }
    for (i = j = 0, len = val.length; j < len; i = ++j) {
      v = val[i];
      if (timeVar && v !== null && v.constructor !== Date) {
        v = v + "";
        if (v.length === 4 && parseInt(v) + "" === v) {
          v += "/01/01";
        }
        d = new Date(v);
        if (d !== "Invalid Date") {
          val[i] = d;
        }
      }
    }
    if (val.length === 1) {
      val = val[0];
    }
    if (val !== null && validObject(node) && typeof variable === "string" && !(variable in node)) {
      cache = vars.data.cacheID + "_" + depth;
      node.d3po.data[cache][variable] = val;
    }
    return val;
  };

  fetchArray = function(vars, arr, variable, depth) {
    var item, j, len, v, val;
    val = [];
    for (j = 0, len = arr.length; j < len; j++) {
      item = arr[j];
      if (validObject(item)) {
        v = find(vars, item, variable, depth);
        val.push(valueParse(vars, item, depth, variable, v));
      } else {
        val.push(item);
      }
    }
    if (typeof val[0] !== "number") {
      val = uniqueValues(val);
    }
    if (val.length === 1) {
      return val[0];
    } else {
      return val;
    }
  };

  fetch = function(vars, node, variable, depth) {
    var nodeObject, val;
    if (!variable) {
      return null;
    }
    if (typeof variable === "number") {
      return variable;
    }
    nodeObject = validObject(node);
    if (!depth) {
      depth = vars.id.value;
    }
    if (nodeObject && node.values instanceof Array) {
      val = fetchArray(vars, node.values, variable, depth);
    } else if (nodeObject && node[variable] instanceof Array) {
      val = fetchArray(vars, node[variable], variable, depth);
    } else if (node instanceof Array) {
      val = fetchArray(vars, node, variable, depth);
    } else {
      val = find(vars, node, variable, depth);
      val = valueParse(vars, node, depth, variable, val);
    }
    return val;
  };

  module.exports = fetch;

}).call(this);
