(() => {
  let buckets;
  let closest;

  buckets = require('../../../../../util/buckets.js');

  closest = require('../../../../../util/closest.js');

  module.exports = (vars, axis, buffer) => {
    let add;
    let additional;
    let allNegative;
    let allPositive;
    let closestTime;
    let copy;
    let d;
    let diff;
    let difference;
    let domain;
    let domainCompare;
    let domainHigh;
    let domainLow;
    let i;
    let lowerDiff;
    let lowerMod;
    let lowerScale;
    let lowerValue;
    let maxSize;
    let opp;
    let orig_domain;
    let range;
    let rangeMax;
    let second;
    let strings;
    let testScale;
    let timeIndex;
    let upperDiff;
    let upperMod;
    let upperScale;
    let upperValue;
    let zero;
    if (
      vars[axis].scale.value !== 'share' &&
      !vars[axis].range.value &&
      vars[axis].reset
    ) {
      testScale = vars[axis].scale.viz.copy();
      if ('clamp' in testScale) {
        testScale.clamp(false);
      }
      if (axis === vars.axes.discrete) {
        domain = testScale.domain();
        if (typeof domain[0] === 'string') {
          i = domain.length;
          while (i >= 0) {
            domain.splice(i, 0, 'd3po_buffer_' + i);
            i--;
          }
          range = testScale.range();
          range = buckets(d3.extent(range), domain.length);
          return vars[axis].scale.viz.domain(domain).range(range);
        } else {
          if (axis.indexOf('y') === 0) {
            domain = domain.slice().reverse();
          }
          if (vars[axis].ticks.values.length === 1) {
            domain = [domain[0], domain[0]];
            if (
              vars[axis].value === vars.time.value &&
              vars.data.time.ticks.length !== 1
            ) {
              closestTime = closest(vars.data.time.ticks, domain[0]);
              timeIndex = vars.data.time.ticks.indexOf(closestTime);
              if (timeIndex > 0) {
                domain[0] = vars.data.time.ticks[timeIndex - 1];
              } else {
                diff = vars.data.time.ticks[timeIndex + 1] - closestTime;
                domain[0] = new Date(closestTime.getTime() - diff);
              }
              if (timeIndex < vars.data.time.ticks.length - 1) {
                domain[1] = vars.data.time.ticks[timeIndex + 1];
              } else {
                diff = closestTime - vars.data.time.ticks[timeIndex - 1];
                domain[1] = new Date(closestTime.getTime() + diff);
              }
            } else {
              domain[0] -= 1;
              domain[1] += 1;
            }
          } else if (vars.axes.scale) {
            difference = Math.abs(domain[1] - domain[0]);
            additional = difference / (vars[axis].ticks.values.length - 1);
            additional = additional / 2;
            rangeMax = testScale.range()[1];
            maxSize = vars.axes.scale.range()[1] * 1.5;
            domainLow = testScale.invert(-maxSize);
            domainHigh = testScale.invert(rangeMax + maxSize);
            if (domain[0] - additional < domainLow) {
              domain[0] = domain[0] - additional;
              domain[domain.length - 1] =
                domain[domain.length - 1] + additional;
            } else {
              domain = [domainLow, domainHigh];
              if (axis.indexOf('y') === 0) {
                domain = domain.reverse();
              }
              domainCompare = testScale.domain();
              domainCompare = domainCompare[1] - domainCompare[0];
              if (!domainCompare) {
                domain[0] -= 1;
                domain[1] += 1;
              }
            }
          } else if (vars[axis].value === vars.time.value) {
            difference = Math.abs(domain[1] - domain[0]);
            additional = difference / (vars[axis].ticks.values.length - 1);
            additional = additional / 2;
            domain[0] = domain[0] - additional;
            domain[1] = domain[1] + additional;
          } else {
            difference = Math.abs(domain[1] - domain[0]);
            add = difference / 2;
            i = domain.length;
            orig_domain = domain.slice();
            while (i >= 0) {
              d = i ? orig_domain[i - 1] + add : orig_domain[i] - add;
              domain.splice(i, 0, d);
              i--;
            }
            range = testScale.range();
            range = buckets(d3.extent(range), domain.length);
            vars[axis].scale.viz.domain(domain).range(range);
          }
          if (axis.indexOf('y') === 0) {
            domain = domain.reverse();
          }
          return vars[axis].scale.viz.domain(domain);
        }
      } else if (
        (buffer === 'x' && axis.indexOf('x') === 0) ||
        (buffer === 'y' && axis.indexOf('y') === 0) ||
        buffer === true
      ) {
        domain = testScale.domain();
        allPositive = domain[0] >= 0 && domain[1] >= 0;
        allNegative = domain[0] <= 0 && domain[1] <= 0;
        if (vars[axis].scale.value === 'log') {
          zero = allPositive ? 1 : -1;
          if (allPositive && axis.indexOf('y') === 0) {
            domain = domain.slice().reverse();
          }
          lowerScale =
            Math.pow(10, parseInt(Math.abs(domain[0])).toString().length - 1) *
            zero;
          lowerMod = domain[0] % lowerScale;
          lowerDiff = lowerMod;
          if (lowerMod && lowerDiff / lowerScale <= 0.1) {
            lowerDiff += lowerScale * zero;
          }
          lowerValue = lowerMod === 0 ? lowerScale : lowerDiff;
          domain[0] -= lowerValue;
          if (domain[0] === 0) {
            domain[0] = zero;
          }
          upperScale =
            Math.pow(10, parseInt(Math.abs(domain[1])).toString().length - 1) *
            zero;
          upperMod = domain[1] % upperScale;
          upperDiff = Math.abs(upperScale - upperMod);
          if (upperMod && upperDiff / upperScale <= 0.1) {
            upperDiff += upperScale * zero;
          }
          upperValue = upperMod === 0 ? upperScale : upperDiff;
          domain[1] += upperValue;
          if (domain[1] === 0) {
            domain[1] = zero;
          }
          if (allPositive && axis.indexOf('y') === 0) {
            domain = domain.reverse();
          }
        } else {
          zero = 0;
          if (axis.indexOf('y') === 0) {
            domain = domain.slice().reverse();
          }
          strings = domain.filter(d => d.constructor === String);
          additional = Math.abs(domain[1] - domain[0]) * 0.05 || 1;
          if (!strings.length) {
            domain[0] = domain[0] - additional;
            domain[1] = domain[1] + additional;
            if (
              (allPositive && domain[0] < zero) ||
              (allNegative && domain[0] > zero)
            ) {
              domain[0] = zero;
            }
            if (
              (allPositive && domain[1] < zero) ||
              (allNegative && domain[1] > zero)
            ) {
              domain[1] = zero;
            }
          }
          if (axis.indexOf('y') === 0) {
            domain = domain.reverse();
          }
        }
        return vars[axis].scale.viz.domain(domain);
      } else if (vars.axes.scale) {
        copy = false;
        if (vars.axes.mirror.value) {
          opp = axis.indexOf('y') === 0 ? 'x' : 'y';
          copy = vars[opp].scale.viz;
          second = vars.width.viz > vars.height.viz ? 'x' : 'y';
        }
        if (axis === second && copy) {
          domain = copy
            .domain()
            .slice()
            .reverse();
        } else {
          rangeMax = testScale.range()[1];
          maxSize = vars.axes.scale.range()[1];
          domainLow = testScale.invert(-maxSize * 1.5);
          domainHigh = testScale.invert(rangeMax + maxSize * 1.5);
          domain = [domainLow, domainHigh];
          if (axis.indexOf('y') === 0) {
            domain = domain.reverse();
          }
          domainCompare = testScale.domain();
          domainCompare = domainCompare[1] - domainCompare[0];
          if (!domainCompare) {
            domain[0] -= 1;
            domain[1] += 1;
          }
          if (axis.indexOf('y') === 0) {
            domain = domain.reverse();
          }
        }
        return vars[axis].scale.viz.domain(domain);
      }
    }
  };
}).call(this);
