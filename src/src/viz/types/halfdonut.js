(() => {
  let comparator;
  let dataThreshold;
  let groupData;
  let halfdonut;

  comparator = require('../../array/comparator.js');

  dataThreshold = require('../../core/data/threshold.js');

  groupData = require('../../core/data/group.js');

  halfdonut = vars => {
    let d;
    let groupedData;
    let halfdonutData;
    let halfdonutLayout;
    let i;
    let item;
    let len;
    let outer_radius;
    let returnData;
    halfdonutLayout = d3.layout
      .pie()
      .value(d => d.value)
      .startAngle(() => -90 * (Math.PI / 180))
      .endAngle(() => 90 * (Math.PI / 180))
      .sort((a, b) => {
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
    halfdonutData = halfdonutLayout(groupedData);
    returnData = [];
    outer_radius =
      d3.min([vars.width.viz / 2, vars.height.viz]) - vars.labels.padding * 2;
    for (i = 0, len = halfdonutData.length; i < len; i++) {
      d = halfdonutData[i];
      item = d.data.d3po;
      item.d3po.startAngle = d.startAngle;
      item.d3po.endAngle = d.endAngle;
      item.d3po.r_inner = outer_radius / 3;
      item.d3po.r_outer = outer_radius;
      item.d3po.x = vars.width.viz / 2;
      item.d3po.y = vars.height.viz;
      item.d3po.share = (d.endAngle - d.startAngle) / (Math.PI * 2);
      returnData.push(item);
    }
    return returnData;
  };

  halfdonut.filter = dataThreshold;

  halfdonut.requirements = ['data', 'size'];

  halfdonut.shapes = ['arc'];

  halfdonut.threshold = vars => (40 * 40) / (vars.width.viz * vars.height.viz);

  module.exports = halfdonut;
}).call(this);
