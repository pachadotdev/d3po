(function() {
    module.exports = {
        accepted: [false, Array, Number, String],
        html: {
            accepted: [Boolean],
            value: false
        },
        init: function(vars) {
            var s;
            s = this.split.value;
            this.split['break'] = new RegExp(
                '[^\\s\\' + s.join('\\') + ']+\\' + s.join('?\\') + '?',
                'g'
            );
            return false;
        },
        split: {
            accepted: [Array],
            process: function(s) {
                this['break'] = new RegExp(
                    '[^\\s\\' + s.join('\\') + ']+\\' + s.join('?\\') + '?',
                    'g'
                );
                return s;
            },
            value: ['-', '/', ';', ':', '&']
        }
    };
}.call(this));
