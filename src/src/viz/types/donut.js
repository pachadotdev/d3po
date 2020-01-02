(function() {
    var comparator, dataThreshold, donut, groupData;

    comparator = require('../../array/comparator.js');

    dataThreshold = require('../../core/data/threshold.js');

    groupData = require('../../core/data/group.js');

    donut = function(vars) {
        var d,
            donutData,
            donutLayout,
            groupedData,
            i,
            item,
            len,
            outer_radius,
            returnData;
        donutLayout = d3.layout
            .pie()
            .value(function(d) {
                return d.value;
            })
            .sort(function(a, b) {
                if (vars.order.value) {
                    return comparator(
                        a.d3po,
                        b.d3po,
                        [vars.order.value],
                        vars.order.sort.value,
                        [],
                        vars
                    );
                } else if (vars.id.nesting.length > 1) {
                    return comparator(
                        a.d3po,
                        b.d3po,
                        vars.id.nesting.concat([vars.size.value]),
                        void 0,
                        [],
                        vars
                    );
                } else {
                    return comparator(
                        a.d3po,
                        b.d3po,
                        [vars.size.value],
                        'desc',
                        [],
                        vars
                    );
                }
            });
        groupedData = groupData(vars, vars.data.viz, []);
        donutData = donutLayout(groupedData);
        returnData = [];
        outer_radius =
      d3.min([vars.width.viz, vars.height.viz]) / 2 - vars.labels.padding * 2;
        for (i = 0, len = donutData.length; i < len; i++) {
            d = donutData[i];
            item = d.data.d3po;
            item.d3po.startAngle = d.startAngle;
            item.d3po.endAngle = d.endAngle;
            item.d3po.r_inner = outer_radius / 3;
            item.d3po.r_outer = outer_radius;
            item.d3po.x = vars.width.viz / 2;
            item.d3po.y = vars.height.viz / 2;
            item.d3po.share = (d.endAngle - d.startAngle) / (Math.PI * 2);
            returnData.push(item);
        }
        return returnData;
    };

    donut.filter = dataThreshold;

    donut.requirements = ['data', 'size'];

    donut.shapes = ['arc'];

    donut.threshold = function(vars) {
        return (40 * 40) / (vars.width.viz * vars.height.viz);
    };

    module.exports = donut;
}.call(this));
