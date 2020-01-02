(function() {
    var print, stringFormat;

    print = require('../../core/console/print.js');

    stringFormat = require('../../string/format.js');

    module.exports = {
        accepted: [void 0],
        process: function(value, vars) {
            var selector, str;
            if (this.initialized === false) {
                return value;
            }
            if (vars.container.value === false) {
                str = vars.format.locale.value.dev.setContainer;
                print.warning(str, 'container');
            } else if (vars.container.value.empty()) {
                str = vars.format.locale.value.dev.noContainer;
                selector = vars.container.selector || '';
                print.warning(stringFormat(str, '"' + selector + '"'), 'container');
            } else {
                if (vars.dev.value) {
                    print.time('total draw time');
                }
                vars.container.value.call(vars.self);
            }
            return value;
        },
        value: void 0
    };
}.call(this));
