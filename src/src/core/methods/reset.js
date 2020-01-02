// Resets certain keys in global variables
(function() {
    var reset, validObject;

    validObject = require('../../object/validate.js');

    reset = function(obj, method) {
        var o;
        if (obj.changed) {
            obj.changed = false;
        }
        if (method === 'draw') {
            obj.frozen = false;
            obj.update = true;
            obj.first = false;
        }
        for (o in obj) {
            if (o.indexOf('d3po') < 0 && validObject(obj[o])) {
                reset(obj[o], o);
            }
        }
    };

    module.exports = reset;
}.call(this));
