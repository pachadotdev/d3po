(function() {
    var copy, objectMerge, objectValidate;

    objectMerge = require('../object/merge.js');

    objectValidate = require('../object/validate.js');

    copy = function(variable) {
        var ret;
        if (objectValidate(variable)) {
            return objectMerge(variable);
        } else if (variable instanceof Array) {
            ret = [];
            variable.forEach(function(o) {
                return ret.push(copy(o));
            });
            return ret;
        } else {
            return variable;
        }
    };

    module.exports = copy;
}.call(this));
