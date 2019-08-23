(function() {
    var fetchValue, shortestPath, uniqueValues, viz,
        indexOf = [].indexOf || function(item) {
            for (var i = 0, l = this.length; i < l; i++) {
                if (i in this && this[i] === item) return i;
            }
            return -1;
        };

    shortestPath = require("../../network/shortestpath.js");

    fetchValue = require("../../core/fetch/value.js");

    uniqueValues = require("../../util/uniques.js");

    viz = function(vars) {
        var base, base1, base2, base3, col, colIndex, columnWidth, columns, edge, edgeInt, edges, i, id, j, k, l, labelSpace, lastDir, lastHop, len, len1, len2, len3, len4, len5, len6, len7, m, maxRadius, minRadius, n, newPath, next, nextDir, nextHop, nextIndex, node, o, p, path, pathInt, pathLookup, paths, prev, prevIndex, q, ref, ref1, ref2, ref3, ref4, ref5, ref6, ref7, rowHeight, rows, size, sizeDomain, val, x, xDiff, y, yDomain;
        edges = [];
        pathLookup = {};
        pathLookup[vars.focus.value[0]] = 0;
        pathLookup[vars.focus.value[1]] = 0;
        paths = {
            all: [
                [vars.focus.value[0]],
                [vars.focus.value[1]]
            ]
        };
        ref = viz.paths;
        for (pathInt = j = 0, len = ref.length; j < len; pathInt = ++j) {
            path = ref[pathInt];
            edges = edges.concat(path.edges);
            lastHop = vars.focus.value[0];
            paths[pathInt] = [lastHop];
            ref1 = path.edges;
            for (edgeInt = k = 0, len1 = ref1.length; k < len1; edgeInt = ++k) {
                edge = ref1[edgeInt];
                edge[vars.edges.source] = vars.data.viz.filter(function(d) {
                    return edge[vars.edges.source][vars.id.value] === d[vars.id.value];
                })[0];
                edge[vars.edges.target] = vars.data.viz.filter(function(d) {
                    return edge[vars.edges.target][vars.id.value] === d[vars.id.value];
                })[0];
                nextDir = edge[vars.edges.source][vars.id.value] === lastHop ? "target" : "source";
                nextHop = edge[vars.edges[nextDir]][vars.id.value];
                if (pathLookup[nextHop] === void 0) {
                    pathLookup[nextHop] = pathInt;
                }
                paths[pathInt].push(nextHop);
                lastHop = nextHop;
            }
        }
        rows = 0;
        for (pathInt in paths) {
            path = paths[pathInt];
            if (pathInt !== "all") {
                newPath = 0;
                for (i = l = 0, len2 = path.length; l < len2; i = ++l) {
                    id = path[i];
                    if ((i !== 0 && i !== (path.length - 1)) && pathLookup[id] === parseFloat(pathInt)) {
                        newPath = 1;
                        prev = path[i - 1];
                        next = path[i + 1];
                        prevIndex = null;
                        nextIndex = null;
                        ref2 = paths.all;
                        for (colIndex = m = 0, len3 = ref2.length; m < len3; colIndex = ++m) {
                            col = ref2[colIndex];
                            if (indexOf.call(col, prev) >= 0) {
                                prevIndex = colIndex;
                            }
                            if (indexOf.call(col, next) >= 0) {
                                nextIndex = colIndex;
                            }
                        }
                        if (prevIndex !== null && nextIndex === null) {
                            if (prevIndex + 1 === paths.all.length - 1) {
                                paths.all.splice(prevIndex + 1, 0, [id]);
                            } else {
                                paths.all[prevIndex + 1].push(id);
                            }
                        } else if (nextIndex - prevIndex === 1) {
                            paths.all.splice(nextIndex, 0, [id]);
                        } else if (nextIndex - prevIndex > 1) {
                            paths.all[nextIndex - 1].push(id);
                        }
                    }
                }
                rows += newPath;
            }
        }
        rowHeight = Math.floor(vars.height.viz / rows);
        yDomain = [];
        i = 0;
        while (i < rows) {
            if (i % 2 === 0) {
                yDomain.push(i);
            } else {
                yDomain.unshift(i);
            }
            i++;
        }
        labelSpace = vars.size.value && !vars.small ? 30 : 0;
        y = d3.scaleOrdinal().domain(yDomain).range(d3.range(rowHeight / 2 - labelSpace, vars.height.viz + rowHeight / 2 - labelSpace, (vars.height.viz - rowHeight) / (rows - 1)));
        columns = paths["all"].length;
        columnWidth = Math.floor(vars.width.viz / columns);
        x = d3.scaleLinear().domain([0, columns - 1]).rangeRound([columnWidth / 2, vars.width.viz - columnWidth / 2]);
        minRadius = 5;
        maxRadius = d3.min([columnWidth, rowHeight - labelSpace]) * 0.4;
        sizeDomain = d3.extent(vars.data.viz, function(node) {
            var val;
            val = fetchValue(vars, node, vars.size.value);
            return val || 0;
        });
        size = vars.size.scale.value.domain(sizeDomain).rangeRound([minRadius, maxRadius]);
        ref3 = vars.data.viz;
        for (n = 0, len4 = ref3.length; n < len4; n++) {
            node = ref3[n];
            if (node.d3po == null) {
                node.d3po = {};
            }
            ref4 = paths["all"];
            for (colIndex = o = 0, len5 = ref4.length; o < len5; colIndex = ++o) {
                col = ref4[colIndex];
                if (ref5 = node[vars.id.value], indexOf.call(col, ref5) >= 0) {
                    node.d3po.x = x(colIndex);
                }
            }
            node.d3po.y = y(pathLookup[node[vars.id.value]]);
            if (vars.size.value) {
                val = fetchValue(vars, node, vars.size.value);
                node.d3po.r = val ? size(val) : minRadius;
            } else {
                node.d3po.r = maxRadius;
            }
            if (node.d3po.r < columnWidth * 0.1 && !vars.small) {
                node.d3po.label = {
                    x: 0,
                    y: node.d3po.r + vars.labels.padding * 2,
                    w: columnWidth * 0.6,
                    h: labelSpace + maxRadius - node.d3po.r,
                    resize: false
                };
            } else {
                delete node.d3po.label;
            }
        }
        ref6 = viz.paths;
        for (pathInt = p = 0, len6 = ref6.length; p < len6; pathInt = ++p) {
            path = ref6[pathInt];
            lastHop = vars.focus.value[0];
            ref7 = path.edges;
            for (edgeInt = q = 0, len7 = ref7.length; q < len7; edgeInt = ++q) {
                edge = ref7[edgeInt];
                nextDir = edge[vars.edges.source][vars.id.value] === lastHop ? "target" : "source";
                lastDir = nextDir === "target" ? "source" : "target";
                nextHop = edge[vars.edges[nextDir]][vars.id.value];
                if (pathLookup[lastHop] !== pathLookup[nextHop]) {
                    edge.d3po = {
                        spline: true
                    };
                    if ((base = edge[vars.edges.source]).d3po == null) {
                        base.d3po = {};
                    }
                    if ((base1 = edge[vars.edges.source].d3po).edges == null) {
                        base1.edges = {};
                    }
                    if ((base2 = edge[vars.edges.target]).d3po == null) {
                        base2.d3po = {};
                    }
                    if ((base3 = edge[vars.edges.target].d3po).edges == null) {
                        base3.edges = {};
                    }
                    xDiff = edge[nextDir].d3po.x - edge[lastDir].d3po.x;
                    edge[lastDir].d3po.edges[edge[nextDir][vars.id.value]] = {
                        angle: Math.PI,
                        radius: columnWidth / 2
                    };
                    edge[nextDir].d3po.edges[edge[lastDir][vars.id.value]] = {
                        angle: 0,
                        radius: columnWidth / 2,
                        offset: xDiff - columnWidth
                    };
                } else {
                    delete edge.d3po;
                }
                lastHop = nextHop;
            }
        }
        return {
            nodes: vars.data.viz,
            edges: edges
        };
    };

    viz.filter = function(vars, data) {
        var added, d, edge, edges, id, ids, j, k, l, len, len1, len2, obj, path, ref, ref1, returnData, source, target;
        edges = vars.edges.filtered || vars.edges.value;
        viz.paths = shortestPath(edges, vars.focus.value[0], {
            target: vars.focus.value[1],
            distance: vars.edges.size.value || void 0,
            nodeid: vars.id.value,
            startpoint: vars.edges.source,
            endpoint: vars.edges.target,
            K: vars.edges.limit.value || 5
        });
        viz.nodes = [];
        added = [];
        ref = viz.paths;
        for (j = 0, len = ref.length; j < len; j++) {
            path = ref[j];
            ref1 = path.edges;
            for (k = 0, len1 = ref1.length; k < len1; k++) {
                edge = ref1[k];
                source = edge[vars.edges.source];
                target = edge[vars.edges.target];
                if (added.indexOf(source[vars.id.value]) < 0) {
                    viz.nodes.push(source);
                    added.push(source[vars.id.value]);
                }
                if (added.indexOf(target[vars.id.value]) < 0) {
                    viz.nodes.push(target);
                    added.push(target[vars.id.value]);
                }
            }
        }
        ids = uniqueValues(viz.nodes, vars.id.value, fetchValue, vars);
        returnData = [];
        for (l = 0, len2 = ids.length; l < len2; l++) {
            id = ids[l];
            d = data.filter(function(d) {
                return d[vars.id.value] === id;
            });
            if (!d[0]) {
                obj = {
                    d3po: {}
                };
                obj[vars.id.value] = id;
                returnData.push(obj);
            } else {
                returnData.push(d[0]);
            }
        }
        return returnData;
    };

    viz.nesting = false;

    viz.requirements = [
        function(vars) {
            return {
                status: vars.focus.value.length === 2,
                text: vars.format.locale.value.method.focus + " x 2"
            };
        }, "edges"
    ];

    viz.scale = 1;

    viz.shapes = ["circle", "square", "donut"];

    viz.tooltip = "static";

    module.exports = viz;

}).call(this);