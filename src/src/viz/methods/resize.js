(function() {
    module.exports = {
        accepted: [Boolean],
        value: false,
        timeout: 400,
        process: function(value, vars) {
            var resize, resizeEnd;
            if (!value) {
                return false;
            }
            resize = null;
            resizeEnd = function() {
                var height, mainNode, width;
                mainNode = vars.container.value
                    .node()
                    .parentNode.getBoundingClientRect();
                width = mainNode.width;
                height = mainNode.height;
                vars.self.width(width);
                vars.self.height(height);
                if (vars.width.changed || vars.height.changed) {
                    return vars.self.draw();
                }
            };
            d3.select(window).on(
                'resize.' + vars.container.id,
                (function(_this) {
                    return function(e) {
                        clearTimeout(resize);
                        return (resize = setTimeout(resizeEnd, _this.timeout));
                    };
                })(this)
            );
            return value;
        }
    };
}.call(this));
