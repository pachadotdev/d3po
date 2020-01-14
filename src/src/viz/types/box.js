(() => {
  let box;
  let fetchValue;
  let graph;
  let stringFormat;
  let strip;
  let uniques;

  fetchValue = require('../../core/fetch/value.js');

  graph = require('./helpers/graph/draw.js');

  stringFormat = require('../../string/format.js');

  strip = require('../../string/strip.js');

  uniques = require('../../util/uniques.js');

  box = vars => {
    let botstr;
    let disMargin;
    let discrete;
    let domains;
    let h;
    let iqrstr;
    let maxstr;
    let medians;
    let medstr;
    let mergeData;
    let minstr;
    let mode;
    let noData;
    let oppMargin;
    let opposite;
    let pctstr;
    let qt1str;
    let qt3str;
    let returnData;
    let size;
    let space;
    let topstr;
    let w;
    graph(vars, {
      buffer: true
    });
    domains = vars.x.domain.viz.concat(vars.y.domain.viz);
    if (domains.indexOf(void 0) >= 0) {
      return [];
    }
    discrete = vars.axes.discrete;
    opposite = vars.axes.opposite;
    disMargin =
      discrete === 'x' ? vars.axes.margin.viz.left : vars.axes.margin.viz.top;
    oppMargin =
      opposite === 'x' ? vars.axes.margin.viz.left : vars.axes.margin.viz.top;
    h = discrete === 'x' ? 'height' : 'width';
    w = discrete === 'x' ? 'width' : 'height';
    space = vars.axes[w] / vars[discrete].ticks.values.length;
    size = vars.size.value;
    size = typeof size === 'number' ? size : 100;
    space = d3.min([space - vars.labels.padding * 2, size]);
    mode = vars.type.mode.value;
    if (!(mode instanceof Array)) {
      mode = [mode, mode];
    }
    mergeData = arr => {
      let key;
      let obj;
      let vals;
      obj = {};
      for (key in vars.data.keys) {
        vals = uniques(arr, key, fetchValue, vars);
        obj[key] = vals.length === 1 ? vals[0] : vals;
      }
      return obj;
    };
    noData = false;
    medians = [];
    iqrstr = vars.format.value(vars.format.locale.value.ui.iqr);
    maxstr = vars.format.value(vars.format.locale.value.ui.max);
    minstr = vars.format.value(vars.format.locale.value.ui.min);
    pctstr = vars.format.value(vars.format.locale.value.ui.percentile);
    botstr = vars.format.value(vars.format.locale.value.ui.tukey_bottom);
    topstr = vars.format.value(vars.format.locale.value.ui.tukey_top);
    qt1str = vars.format.value(vars.format.locale.value.ui.quartile_first);
    qt3str = vars.format.value(vars.format.locale.value.ui.quartile_third);
    medstr = vars.format.value(vars.format.locale.value.ui.median);
    returnData = [];
    d3.nest()
      .key(d => fetchValue(vars, d, vars[discrete].value))
      .rollup(leaves => {
        let bottom;
        let bottomLabel;
        let bottomWhisker;
        let boxData;
        let d;
        let diff1;
        let diff2;
        let first;
        let i;
        let iqr;
        let j;
        let key;
        let label;
        let len;
        let len1;
        let median;
        let medianBuffer;
        let medianData;
        let medianHeight;
        let medianText;
        let outliers;
        let scale;
        let second;
        let tooltipData;
        let top;
        let topLabel;
        let topWhisker;
        let val;
        let values;
        let x;
        let y;
        scale = vars[opposite].scale.viz;
        values = leaves.map(d => fetchValue(vars, d, vars[opposite].value));
        values.sort((a, b) => a - b);
        first = d3.quantile(values, 0.25);
        median = d3.quantile(values, 0.5);
        second = d3.quantile(values, 0.75);
        tooltipData = {};
        if (mode[1] === 'tukey') {
          iqr = first - second;
          top = second - iqr * 1.5;
          topLabel = topstr;
        } else if (mode[1] === 'extent') {
          top = d3.max(values);
          topLabel = maxstr;
        } else if (typeof mode[1] === 'number') {
          top = d3.quantile(values, (100 - mode[1]) / 100);
          topLabel = stringFormat(pctstr, mode[1]);
        }
        top = d3.min([d3.max(values), top]);
        if (vars.tooltip.extent.value) {
          tooltipData[topLabel] = {
            key: vars[opposite].value,
            value: top
          };
        }
        if (vars.tooltip.iqr.value) {
          tooltipData[qt3str] = {
            key: vars[opposite].value,
            value: second
          };
          tooltipData[medstr] = {
            key: vars[opposite].value,
            value: median
          };
          tooltipData[qt1str] = {
            key: vars[opposite].value,
            value: first
          };
        }
        if (mode[0] === 'tukey') {
          iqr = first - second;
          bottom = first + iqr * 1.5;
          bottomLabel = botstr;
        } else if (mode[0] === 'extent') {
          bottom = d3.min(values);
          bottomLabel = minstr;
        } else if (typeof mode[0] === 'number') {
          bottom = d3.quantile(values, mode[0] / 100);
          topLabel = stringFormat(pctstr, mode[0]);
        }
        bottom = d3.max([d3.min(values), bottom]);
        if (vars.tooltip.extent.value) {
          tooltipData[bottomLabel] = {
            key: vars[opposite].value,
            value: bottom
          };
        }
        boxData = [];
        bottomWhisker = [];
        topWhisker = [];
        outliers = [];
        for (i = 0, len = leaves.length; i < len; i++) {
          d = leaves[i];
          val = fetchValue(vars, d, vars[opposite].value);
          if (val >= first && val <= second) {
            boxData.push(d);
          } else if (val >= bottom && val < first) {
            bottomWhisker.push(d);
          } else if (val <= top && val > second) {
            topWhisker.push(d);
          } else {
            outliers.push(d);
          }
        }
        key = fetchValue(vars, leaves[0], vars[discrete].value);
        x = vars[discrete].scale.viz(key);
        x += disMargin;
        label = vars.format.value(key, {
          key: vars[discrete].value,
          vars: vars
        });
        if (key.constructor === Date) {
          key = key.getTime();
        }
        key = strip(key);
        boxData = mergeData(boxData);
        boxData.d3po = {
          color: 'white',
          id: 'box_' + key,
          init: {},
          label: false,
          shape: 'square',
          stroke: '#444',
          text: stringFormat(iqrstr, label)
        };
        boxData.d3po[w] = space;
        boxData.d3po.init[w] = space;
        boxData.d3po[h] = Math.abs(scale(first) - scale(second));
        boxData.d3po[discrete] = x;
        y = d3.min([scale(first), scale(second)]) + boxData.d3po[h] / 2;
        y += oppMargin;
        boxData.d3po[opposite] = y;
        boxData.d3po.tooltip = tooltipData;
        returnData.push(boxData);
        medianData = {
          d3po: {
            id: 'median_line_' + key,
            position: h === 'height' ? 'top' : 'right',
            shape: 'whisker',
            static: true
          }
        };
        medianText = vars.format.value(median, {
          key: vars[opposite].value,
          vars: vars
        });
        label = {
          background: '#fff',
          names: [medianText],
          padding: 0,
          resize: false,
          x: 0,
          y: 0
        };
        diff1 = Math.abs(scale(median) - scale(first));
        diff2 = Math.abs(scale(median) - scale(second));
        medianHeight = d3.min([diff1, diff2]) * 2;
        medianBuffer = vars.data.stroke.width * 2 + vars.labels.padding * 2;
        label[w === 'width' ? 'w' : 'h'] = space - medianBuffer;
        label[h === 'width' ? 'w' : 'h'] = medianHeight - medianBuffer;
        medianData.d3po.label = label;
        medianData.d3po[w] = space;
        medianData.d3po[discrete] = x;
        medianData.d3po[opposite] = scale(median) + oppMargin;
        returnData.push(medianData);
        bottomWhisker = mergeData(bottomWhisker);
        bottomWhisker.d3po = {
          id: 'bottom_whisker_line_' + key,
          offset: boxData.d3po[h] / 2,
          position: h === 'height' ? 'bottom' : 'left',
          shape: 'whisker',
          static: true
        };
        if (opposite === 'x') {
          bottomWhisker.d3po.offset *= -1;
        }
        bottomWhisker.d3po[h] = Math.abs(scale(bottom) - scale(first));
        bottomWhisker.d3po[w] = space;
        bottomWhisker.d3po[discrete] = x;
        bottomWhisker.d3po[opposite] = y;
        returnData.push(bottomWhisker);
        topWhisker = mergeData(topWhisker);
        topWhisker.d3po = {
          id: 'top_whisker_line_' + key,
          offset: boxData.d3po[h] / 2,
          position: h === 'height' ? 'top' : 'right',
          shape: 'whisker',
          static: true
        };
        if (opposite === 'y') {
          topWhisker.d3po.offset *= -1;
        }
        topWhisker.d3po[h] = Math.abs(scale(top) - scale(second));
        topWhisker.d3po[w] = space;
        topWhisker.d3po[discrete] = x;
        topWhisker.d3po[opposite] = y;
        returnData.push(topWhisker);
        for (j = 0, len1 = outliers.length; j < len1; j++) {
          d = outliers[j];
          d.d3po[discrete] = x;
          d.d3po[opposite] = scale(fetchValue(vars, d, vars.y.value));
          d.d3po[opposite] += oppMargin;
          d.d3po.r = 4;
          d.d3po.shape = vars.shape.value;
        }
        noData = !outliers.length && top - bottom === 0;
        medians.push(median);
        returnData = returnData.concat(outliers);
        return leaves;
      })
      .entries(vars.data.viz);
    if (noData && uniques(medians).length === 1) {
      return [];
    } else {
      return returnData;
    }
  };

  box.modes = ['tukey', 'extent', Array, Number];

  box.requirements = ['data', 'x', 'y'];

  box.shapes = ['circle', 'square'];

  box.setup = vars => {
    let axis;
    if (!vars.axes.discrete) {
      axis = vars.time.value === vars.y.value ? 'y' : 'x';
      return vars.self[axis]({
        scale: 'discrete'
      });
    }
  };

  module.exports = box;
}).call(this);
