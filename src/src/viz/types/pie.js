(function() {
  var comparator, dataThreshold, groupData, pie;

  comparator = require('../../array/comparator.js');

  dataThreshold = require('../../core/data/threshold.js');

  groupData = require('../../core/data/group.js');

  pie = function(vars) {
    var d, groupedData, i, item, len, pieData, pieLayout, radius, returnData;
    pieLayout = d3.layout
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
    pieData = pieLayout(groupedData);
    returnData = [];
    radius =
      d3.min([vars.width.viz, vars.height.viz]) / 2 - vars.labels.padding * 2;
    for (i = 0, len = pieData.length; i < len; i++) {
      d = pieData[i];
      item = d.data.d3po;
      item.d3po.startAngle = d.startAngle;
      item.d3po.endAngle = d.endAngle;
      item.d3po.r_inner = 0;
      item.d3po.r_outer = radius;
      item.d3po.x = vars.width.viz / 2;
      item.d3po.y = vars.height.viz / 2;
      item.d3po.share = (d.endAngle - d.startAngle) / (Math.PI * 2);
      returnData.push(item);
    }
    return returnData;
  };

  pie.filter = dataThreshold;

  pie.requirements = ['data', 'size'];

  pie.shapes = ['arc'];

  pie.threshold = function(vars) {
    return (40 * 40) / (vars.width.viz * vars.height.viz);
  };

  module.exports = pie;
}.call(this));
