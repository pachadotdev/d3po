(function() {
    module.exports = function(position) {
        var accepted;
        accepted = ["top", "middle", "bottom"];
        if (position === false) {
            accepted.unshift(false);
        }
        if (accepted.indexOf(position) < 0) {
            position = "bottom";
        }
        return {
            accepted: accepted,
            mapping: {
                top: "0ex",
                middle: "0.5ex",
                bottom: "1ex"
            },
            process: function(value) {
                this.text = value;
                return this.mapping[value];
            },
            value: position
        };
    };

}).call(this);