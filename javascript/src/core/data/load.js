// Load Data using JSON
(function() {
  var print, validObject;

  print = require("../console/print.js");

  validObject = require("../../object/validate.js");

  module.exports = function(vars, key, next) {
    var consoleMessage, fileType, parser, url;
    consoleMessage = vars.dev.value;
    if (consoleMessage) {
      print.time("loading " + key);
    }
    url = vars[key].url;
    if (!vars[key].filetype.value) {
      fileType = url.slice(url.length - 5).split(".");
      if (fileType.length > 1) {
        fileType = fileType[1];
      } else {
        fileType = false;
      }
      if (fileType) {
        if (fileType === "txt") {
          fileType = "text";
        }
        if (vars[key].filetype.accepted.indexOf(fileType) < 0) {
          fileType = "json";
        }
      } else {
        fileType = "json";
      }
    } else {
      fileType = vars[key].filetype.value;
    }
    if (fileType === "dsv") {
      parser = d3.dsv(vars[key].delimiter.value, "text/plain");
    } else {
      parser = d3[fileType];
    }
    return parser(url, function(error, data) {
      var k, ret;
      if (!error && data) {
        if (typeof vars[key].callback === "function") {
          ret = vars[key].callback(data);
          if (ret) {
            if (validObject(ret) && key in ret) {
              for (k in ret) {
                if (k in vars) {
                  vars[k].value = ret[k];
                }
              }
            } else {
              vars[key].value = ret;
            }
          }
        } else {
          vars[key].value = data;
        }
        if (["json"].indexOf(fileType) < 0) {
          vars[key].value.forEach(function(d) {
            var results;
            results = [];
            for (k in d) {
              if (!isNaN(d[k])) {
                results.push(d[k] = parseFloat(d[k]));
              } else if (d[k].toLowerCase() === "false") {
                results.push(d[k] = false);
              } else if (d[k].toLowerCase() === "true") {
                results.push(d[k] = true);
              } else if (d[k].toLowerCase() === "null") {
                results.push(d[k] = null);
              } else {
                if (d[k].toLowerCase() === "undefined") {
                  results.push(d[k] = void 0);
                } else {
                  results.push(void 0);
                }
              }
            }
            return results;
          });
        }
        vars[key].changed = true;
        vars[key].loaded = true;
      } else {
        vars.error.internal = "Could not load data from: \"" + url + "\"";
      }
      if (consoleMessage) {
        print.timeEnd("loading " + key);
      }
      return next();
    });
  };

}).call(this);
