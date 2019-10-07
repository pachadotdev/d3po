// Get Key Types from Data
(function() {
    var print, validObject,
        indexOf = [].indexOf || function(item) {
            for (var i = 0, l = this.length; i < l; i++) {
                if (i in this && this[i] === item) return i;
            }
            return -1;
        };

    print = require("../console/print.js");

    validObject = require("../../object/validate.js");

    module.exports = function(vars, type) {
        var get_keys, k, kk, lengthMatch, ref, ref1, timerString, v, vv;
        timerString = type + " key analysis";
        if (vars.dev.value) {
            print.time(timerString);
        }
        vars[type].keys = {};
        get_keys = function(arr) {
            var a, i, k, len, results, results1, v;
            if (arr instanceof Array) {
                results = [];
                for (i = 0, len = arr.length; i < len; i++) {
                    a = arr[i];
                    results.push(get_keys(a));
                }
                return results;
            } else if (validObject(arr)) {
                results1 = [];
                for (k in arr) {
                    v = arr[k];
                    if (k.indexOf("d3po") !== 0 && !(indexOf.call(vars[type].keys, k) >= 0) && v !== null) {
                        results1.push(vars[type].keys[k] = typeof v);
                    } else {
                        results1.push(void 0);
                    }
                }
                return results1;
            }
        };
        if (validObject(vars[type].value)) {
            lengthMatch = d3.keys(vars[type].value).length === vars.id.nesting.length;
            ref = vars[type].value;
            for (k in ref) {
                v = ref[k];
                if (lengthMatch && vars.id.nesting.indexOf(k) >= 0 && validObject(v)) {
                    for (kk in v) {
                        vv = v[kk];
                        get_keys(vv);
                    }
                } else {
                    get_keys(v);
                }
            }
        } else {
            ref1 = vars[type].value;
            for (k in ref1) {
                v = ref1[k];
                get_keys(v);
            }
        }
        if (vars.dev.value) {
            return print.time(timerString);
        }
    };

}).call(this);