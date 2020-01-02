(function() {
    var rendering;

    rendering = require('../../core/methods/rendering.js');

    module.exports = {
        accepted: function(vars) {
            var list;
            list = vars.types[vars.type.value].shapes;
            if (list && !(list instanceof Array)) {
                list = [list];
            }
            if (list.length) {
                return list;
            } else {
                return ['square'];
            }
        },
        interpolate: {
            accepted: [
                'basis',
                'basis-open',
                'cardinal',
                'cardinal-open',
                'linear',
                'monotone',
                'step',
                'step-before',
                'step-after'
            ],
            value: 'linear'
        },
        rendering: rendering(),
        value: false
    };
}.call(this));
