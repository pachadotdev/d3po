(function() {
    var arraySort, axisRange, buckets, buffer, dataChange, fetchData, fetchValue, getData, getScale, print, sizeScale, uniques;

    arraySort = require("../../../../../array/sort.js");

    buffer = require("./buffer.js");

    buckets = require("../../../../../util/buckets.js");

    fetchData = require("../../../../../core/fetch/data.js");

    fetchValue = require("../../../../../core/fetch/value.js");

    print = require("../../../../../core/console/print.js");

    uniques = require("../../../../../util/uniques.js");

    module.exports = function(vars, opts) {
        var axes, axis, changed, domains, i, j, len, len1, oppAxis, range, reorder, zero;
        changed = dataChange(vars);
        if (changed || !vars.axes.dataset) {
            vars.axes.dataset = getData(vars);
        }
        vars.axes.scale = opts.buffer && opts.buffer !== true ? sizeScale(vars, opts.buffer) : false;
        axes = vars.width.viz > vars.height.viz ? ["y", "y2", "x", "x2"] : ["x", "x2", "y", "y2"];
        for (i = 0, len = axes.length; i < len; i++) {
            axis = axes[i];
            oppAxis = axis.indexOf("x") === 0 ? "y" : "x";
            reorder = vars.order.changed || vars.order.sort.changed || (vars.order.value === true && vars[oppAxis].changed);
            if (vars[axis].value && (!vars[axis].ticks.values || changed || reorder || (vars[axis].value === vars.time.value && vars.time.fixed.value))) {
                if (vars.dev.value) {
                    print.time("calculating " + axis + " axis");
                }
                vars[axis].reset = true;
                vars[axis].ticks.values = false;
                if (axis === vars.axes.discrete && vars[axis].value !== vars.time.value) {
                    vars[axis].ticks.values = uniques(vars.axes.dataset, vars[axis].value, fetchValue, vars);
                }
                zero = opts.zero === true || axis.indexOf(opts.zero) === 0 ? true : false;
                range = axisRange(vars, axis, zero);
                if (axis.indexOf("y") === 0) {
                    range = range.reverse();
                }
                vars[axis].scale.viz = getScale(vars, axis, range);
                vars[axis].domain.viz = range;
                if (vars.dev.value) {
                    print.timeEnd("calculating " + axis + " axis");
                }
            }
        }
        if (vars.axes.mirror.value) {
            domains = d3.extent(vars.y.domain.viz.concat(vars.x.domain.viz));
            vars.x.domain.viz = domains;
            vars.x.scale.viz.domain(domains);
            domains = domains.slice().reverse();
            vars.y.domain.viz = domains;
            vars.y.scale.viz.domain(domains);
        }
        if (opts.buffer) {
            for (j = 0, len1 = axes.length; j < len1; j++) {
                axis = axes[j];
                if (axis !== vars.axes.discrete) {
                    buffer(vars, axis, opts.buffer);
                }
            }
        }
    };

    dataChange = function(vars) {
        var axis, changed, check, i, j, k, l, len, len1, len2, ref, sub, subs;
        changed = !vars.time.fixed.value && (vars.time.solo.changed || vars.time.mute.changed);
        if (!changed) {
            changed = vars.id.solo.changed || vars.id.mute.changed;
        }
        if (changed) {
            return changed;
        }
        check = ["data", "time", "id", "depth", "type", "width", "height", "x", "y", "x2", "y2"];
        for (i = 0, len = check.length; i < len; i++) {
            k = check[i];
            if (vars[k].changed) {
                changed = true;
                break;
            }
        }
        if (changed) {
            return changed;
        }
        subs = ["mute", "range", "scale", "solo", "stacked", "zerofill"];
        ref = ["x", "y", "x2", "y2"];
        for (j = 0, len1 = ref.length; j < len1; j++) {
            axis = ref[j];
            for (l = 0, len2 = subs.length; l < len2; l++) {
                sub = subs[l];
                if (vars[axis][sub].changed) {
                    changed = true;
                    break;
                }
            }
        }
        return changed;
    };

    getData = function(vars) {
        var d, depths;
        if (!vars.time.fixed.value) {
            return vars.data.viz;
        } else {
            depths = d3.range(0, vars.id.nesting.length);
            return d3.merge(d3.merge([
                (function() {
                    var i, len, results;
                    results = [];
                    for (i = 0, len = depths.length; i < len; i++) {
                        d = depths[i];
                        results.push(fetchData(vars, "all", d));
                    }
                    return results;
                })()
            ]));
        }
    };

    axisRange = function(vars, axis, zero, buffer) {
        var agg, aggType, allNegative, allPositive, axisSums, counts, d, group, i, j, k, l, len, len1, len2, len3, m, min, oppAxis, ref, ref1, ref2, ref3, sort, sortKey, splitData, v, val, values;
        oppAxis = axis.indexOf("x") === 0 ? "y" : "x";
        if (vars[axis].range.value && vars[axis].range.value.length === 2) {
            return vars[axis].range.value.slice();
        } else if (vars[axis].scale.value === "share") {
            vars[axis].ticks.values = d3.range(0, 1.1, 0.1);
            return [0, 1];
        } else if (vars[axis].stacked.value) {
            splitData = [];
            ref = vars.axes.dataset;
            for (i = 0, len = ref.length; i < len; i++) {
                d = ref[i];
                if (d.values) {
                    splitData = splitData.concat(d.values);
                } else {
                    splitData.push(d);
                }
            }
            axisSums = d3.nest().key(function(d) {
                return fetchValue(vars, d, vars[oppAxis].value);
            }).rollup(function(leaves) {
                var negatives, positives;
                positives = d3.sum(leaves, function(d) {
                    var val;
                    val = fetchValue(vars, d, vars[axis].value);
                    if (val > 0) {
                        return val;
                    } else {
                        return 0;
                    }
                });
                negatives = d3.sum(leaves, function(d) {
                    var val;
                    val = fetchValue(vars, d, vars[axis].value);
                    if (val < 0) {
                        return val;
                    } else {
                        return 0;
                    }
                });
                return [negatives, positives];
            }).entries(splitData);
            values = d3.merge(axisSums.map(function(d) {
                return d.values;
            }));
            return d3.extent(values);
        } else if (vars[axis].value === vars.time.value) {
            if (vars.time.solo.value.length) {
                return d3.extent(vars.time.solo.value).map(function(v) {
                    if (v.constructor !== Date) {
                        v = v + "";
                        if (v.length === 4 && parseInt(v) + "" === v) {
                            v += "/01/01";
                        }
                        return new Date(v);
                    } else {
                        return v;
                    }
                });
            } else {
                return d3.extent(vars.data.time.ticks);
            }
        } else {
            values = [];
            ref1 = vars.axes.dataset;
            for (j = 0, len1 = ref1.length; j < len1; j++) {
                d = ref1[j];
                val = fetchValue(vars, d, vars[axis].value);
                if (val instanceof Array) {
                    values = values.concat(val);
                } else {
                    values.push(val);
                }
            }
            values = values.filter(function(d) {
                return d !== null;
            });
            if (axis === vars.axes.discrete) {
                if (vars.order.value === true) {
                    sortKey = vars[oppAxis].value;
                } else {
                    sortKey = vars.order.value;
                }
                if (sortKey) {
                    sort = vars.order.sort.value;
                    agg = vars.order.agg.value || vars.aggs.value[sortKey] || "max";
                    aggType = typeof agg;
                    counts = values.reduce(function(obj, val) {
                        obj[val] = [];
                        return obj;
                    }, {});
                    ref2 = vars.axes.dataset;
                    for (l = 0, len2 = ref2.length; l < len2; l++) {
                        d = ref2[l];
                        if (d.values) {
                            ref3 = d.values;
                            for (m = 0, len3 = ref3.length; m < len3; m++) {
                                v = ref3[m];
                                group = fetchValue(vars, v, vars[axis].value);
                                counts[group].push(fetchValue(vars, v, sortKey));
                            }
                        } else {
                            group = fetchValue(vars, d, vars[axis].value);
                            counts[group].push(fetchValue(vars, d, sortKey));
                        }
                    }
                    for (k in counts) {
                        v = counts[k];
                        if (aggType === "string") {
                            counts[k] = d3[agg](v);
                        } else if (aggType === "function") {
                            counts[k] = agg(v, sortKey);
                        }
                    }
                    counts = arraySort(d3.entries(counts), "value", sort);
                    counts = counts.reduce(function(arr, v) {
                        arr.push(v.key);
                        return arr;
                    }, []);
                    return counts;
                } else if (values[0].constructor === String) {
                    return uniques(values).sort(function(a, b) {
                        return "" + a.localeCompare("" + b);
                    });
                } else {
                    return uniques(values).sort(function(a, b) {
                        return a - b;
                    });
                }
            } else {
                values.sort(function(a, b) {
                    return a - b;
                });
                if (vars[axis].scale.value === "log") {
                    if (values[0] === 0) {
                        values[0] = 1;
                    }
                    if (values[values.length - 1] === 0) {
                        values[values.length - 1] = -1;
                    }
                }
                if (zero) {
                    allPositive = values.every(function(v) {
                        return v > 0;
                    });
                    allNegative = values.every(function(v) {
                        return v < 0;
                    });
                    if (allPositive || allNegative) {
                        min = allPositive ? 1 : -1;
                        values.push(vars[axis].scale.value === "log" ? min : 0);
                    }
                }
                return d3.extent(values);
            }
        }
    };

    getScale = function(vars, axis, range) {
        var rangeArray, rangeMax, retScale, scaleType, t;
        rangeMax = axis.indexOf("x") === 0 ? vars.width.viz : vars.height.viz;
        scaleType = vars[axis].scale.value;
        if (["discrete", "share"].indexOf(scaleType) >= 0) {
            scaleType = "linear";
        }
        t = 10;
        if (typeof range[0] === "string") {
            scaleType = "ordinal";
            rangeArray = buckets([0, rangeMax], range.length);
        } else {
            rangeArray = [0, rangeMax];
            if (vars[axis].scale.value === "linear") {
                t = Math.floor(rangeMax / (vars[axis].ticks.font.size * 4));
            }
        }
        vars[axis].scale.ticks = t;
        retScale = d3.scale[scaleType]().domain(range).range(rangeArray);
        if ("clamp" in retScale) {
            retScale.clamp(true);
        }
        return retScale;
    };

    sizeScale = function(vars, value) {
        var domain, max, min;
        if (value === true) {
            value = "size";
        }
        if (value in vars) {
            value = vars[value].value;
        }
        min = vars.size.scale.range.min.value;
        if (typeof min === "function") {
            min = min(vars);
        }
        max = vars.size.scale.range.max.value;
        if (typeof max === "function") {
            max = max(vars);
        }
        if (value === false) {
            return vars.size.scale.value.domain([0, 1]).rangeRound([max, max]);
        } else if (typeof value === "number") {
            return vars.size.scale.value.domain([0, 1]).rangeRound([value, value]);
        } else if (value) {
            if (vars.dev.value) {
                print.time("calculating buffer scale");
            }
            domain = d3.extent(vars.axes.dataset, function(d) {
                var val;
                val = fetchValue(vars, d, value);
                if (!val) {
                    return 0;
                } else {
                    return val;
                }
            });
            if (domain[0] === domain[1]) {
                min = max;
            }
            if (vars.dev.value) {
                print.timeEnd("calculating buffer scale");
            }
            return vars.size.scale.value.domain(domain).rangeRound([min, max]);
        }
    };

}).call(this);