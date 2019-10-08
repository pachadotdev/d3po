// Determines visible time markers and formatting
(function() {
    var multiFormat, sizes;

    multiFormat = require("./multiformat.js"),
    sizes = require("../../font/sizes.js");

    module.exports = function(vars, opts) {
        var f, format, func, getFormat, limit, locale, p, periods, pp, prev, render, small, step, style, time, total, vals, values;
        values = opts.values || vars.data.time.ticks;
        style = opts.style || {};
        limit = opts.limit || vars.width.value;
        time = {};
        periods = vars.data.time.periods;
        step = vars.data.time.stepType;
        total = vars.data.time.totalType;
        func = vars.data.time.functions;
        getFormat = vars.data.time.getFormat;
        locale = vars.format.locale.value.format;
        if (vars.time.format.value) {
            time.format = vars.data.time.format;
            time.values = values;
            time.sizes = sizes(values.map(function(v) {
                return time.format(v);
            }), style);
        } else {
            p = periods.indexOf(step);
            while (p <= periods.indexOf(total)) {
                vals = values.filter(function(t) {
                    var match, pp;
                    if (p === periods.indexOf(step)) {
                        return true;
                    }
                    match = true;
                    pp = p - 1;
                    if (p < 0) {
                        return true;
                    }
                    while (pp >= periods.indexOf(step)) {
                        if (!match) {
                            break;
                        }
                        match = !func[pp](t);
                        pp--;
                    }
                    return match;
                });
                if (periods[p] === total) {
                    format = d3.timeFormatLocale(locale).format(getFormat(periods[p], total));
                } else {
                    pp = p;
                    format = [];
                    while (pp <= periods.indexOf(total)) {
                        prev = pp - 1 < periods.indexOf(step) ? pp : pp - 1;
                        prev = periods[prev];
                        small = periods[pp] === prev && step !== total;
                        f = getFormat(prev, periods[pp], small);
                        format.push([f, func[pp]]);
                        pp++;
                    }
                    format[format.length - 1][1] = function() {
                        return true;
                    };
                    format = multiFormat(d3.timeFormatLocale(locale), format);
                }
                render = sizes(vals.map(function(v) {
                    return format(v);
                }), style);
                if (d3.sum(render, function(r) {
                        return r.width;
                    }) < limit || p === periods.indexOf(total)) {
                    time.format = format;
                    time.values = vals;
                    time.sizes = render;
                    break;
                }
                p++;
            }
        }
        return time;
    };

}).call(this);