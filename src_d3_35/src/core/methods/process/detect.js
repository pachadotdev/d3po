// Process object's value
(function() {
    var copy, update;

    copy = require("../../../util/copy.js");

    update = require("../../../array/update.js");

    module.exports = function(vars, object, value) {
        if (object.process === Array) {
            return update(copy(object.value), value);
        } else if (typeof object.process === "object" && typeof value === "string") {
            return object.process[value];
        } else if (typeof object.process === "function") {
            return object.process(value, vars, object);
        } else {
            return value;
        }
    };

}).call(this);