(function() {
    var d3selection;

    d3selection = require("../../util/d3selection.js");

    module.exports = {
        accepted: [false, Array, Object, String],
        id: "default",
        process: function(value, vars) {
            if (value === false) {
                return false;
            }
            if (vars.container.id === "default") {
                vars.self.container({
                    id: "d3po_" + +new Date()
                });
            }
            if (d3selection(value)) {
                return value.append("div");
            } else if (value instanceof Array) {
                return d3.select(value[0][0]).append("div");
            } else {
                this.selector = value;
                return d3.select(value).append("div");
            }
        },
        value: false
    };

}).call(this);