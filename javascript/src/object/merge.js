// Given any two objects, this method will merge the two objects together, returning a new third object. The values of the second object always overwrite the first
(function() {
  var d3selection, validate;

  d3selection = require("../util/d3selection.coffee");

  validate = require("./validate.js");

  /**
   * @method d3po.object.merge
   * @for d3po.object
   * @param obj1 {Object} The primary object.
   * @param obj2 {Object} The secondary object to merge into the first.
   * @return {Object}
   */

  module.exports = function(obj1, obj2) {
    var copyObject, obj3;
    copyObject = function(obj, ret, shallow) {
      var k, results, v;
      results = [];
      for (k in obj) {
        v = obj[k];
        if (typeof v !== "undefined") {
          if (!shallow && validate(v)) {
            if (typeof ret[k] !== "object") {
              ret[k] = {};
            }
            results.push(copyObject(v, ret[k], k.indexOf("d3po") === 0));
          } else if (!d3selection(v) && v instanceof Array) {
            results.push(ret[k] = v.slice(0));
          } else {
            results.push(ret[k] = v);
          }
        } else {
          results.push(void 0);
        }
      }
      return results;
    };
    obj3 = {};
    if (obj1) {
      copyObject(obj1, obj3);
    }
    if (obj2) {
      copyObject(obj2, obj3);
    }
    return obj3;
  };

}).call(this);
