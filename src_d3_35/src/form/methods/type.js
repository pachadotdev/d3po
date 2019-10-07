(function() {
    module.exports = {
        accepted: function(vars) {
            return d3.keys(vars.types);
        },
        value: "auto"
    };

}).call(this);