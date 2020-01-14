(() => {
  var dataThreshold, groupData, mergeObject, treemap;

  dataThreshold = require('../../core/data/threshold.js');

  groupData = require('../../core/data/group.js');

  mergeObject = require('../../object/merge.js');

  treemap = vars => {
    var d, data, groupedData, i, len, returnData, root;
    groupedData = groupData(vars, vars.data.viz);
    data = d3.layout
      .treemap()
      .mode(vars.type.mode.value)
      .round(true)
      .size([vars.width.viz, vars.height.viz])
      .children(d => d.values)
      .padding(vars.data.padding.value)
      .sort((a, b) => {
        var sizeDiff;
        sizeDiff = a.value - b.value;
        if (sizeDiff === 0) {
          return a.id < b.id;
        } else {
          return sizeDiff;
        }
      })
      .nodes({
        name: 'root',
        values: groupedData
      })
      .filter(d => !d.values && d.area);
    if (data.length) {
      root = data[0];
      while (root.parent) {
        root = root.parent;
      }
      returnData = [];
      for (i = 0, len = data.length; i < len; i++) {
        d = data[i];
        d.d3po.d3po = mergeObject(d.d3po.d3po, {
          x: d.x + d.dx / 2,
          y: d.y + d.dy / 2,
          width: d.dx,
          height: d.dy,
          share: d.value / root.value
        });
        returnData.push(d.d3po);
      }
    }
    return returnData;
  };

  treemap.filter = dataThreshold;

  treemap.modes = ['squarify', 'slice', 'dice', 'slice-dice'];

  treemap.requirements = ['data', 'size'];

  treemap.shapes = ['square'];

  treemap.threshold = vars => (40 * 40) / (vars.width.viz * vars.height.viz);

  module.exports = treemap;
}).call(this);
