const dataFilter = require('../data/filter.js');
const dataNest = require('../data/nest.js');
const print = require('../console/print.js');
const stringFormat = require('../../string/format.js');
const stringList = require('../../string/list.js');

//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
// Fetches specific years of data
//-------------------------------------------------------------------
module.exports = (vars, years, depth) => {
  if (!vars.data.value) {
    return [];
  }

  if (depth === undefined) {
    depth = vars.depth.value;
  }
  const nestLevel = vars.id.nesting[depth];

  if (years && !(years instanceof Array)) {
    years = [years];
  }

  //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // If "years" have not been requested, determine the years using .time()
  // solo and mute
  //----------------------------------------------------------------------------
  if (!years && 'time' in vars) {
    years = [];

    const key = vars.time.solo.value.length ? 'solo' : 'mute';
    const filterList = vars.time[key].value;

    if (filterList.length) {
      years = [];
      for (let yi = 0; yi < filterList.length; yi++) {
        let y = filterList[yi];

        if (typeof y === 'function') {
          for (let ti = 0; ti < vars.data.time.values.length; ti++) {
            const ms = vars.data.time.values[ti].getTime();
            if (y(ms)) {
              years.push(ms);
            }
          }
        } else if (y.constructor === Date) {
          years.push(new Date(y).getTime());
        } else {
          y += '';
          if (y.length === 4 && parseInt(y) + '' === y) {
            y = y + '/01/01';
          }
          const d = new Date(y);
          if (d !== 'Invalid Date') {
            // d.setTime(d.getTime() + d.getTimezoneOffset() * 60 * 1000);
            years.push(d.getTime());
          }
        }
      }

      if (key === 'mute') {
        years = vars.data.time.values.filter(
          t => years.indexOf(t.getTime()) < 0
        );
      }
    } else {
      years.push('all');
    }
  } else {
    years = ['all'];
  }

  if (years.indexOf('all') >= 0 && vars.data.time.values.length) {
    years = vars.data.time.values.slice(0);
    for (let i = 0; i < years.length; i++) {
      years[i] = years[i].getTime();
    }
  }

  let cacheID = [vars.type.value, nestLevel, depth]
    .concat(vars.data.filters)
    .concat(years);

  const filter = vars.data.solo.length ? 'solo' : 'mute';
  const cacheKeys = d3.keys(vars.data.cache);
  const vizFilter = vars.types[vars.type.value].filter || undefined;

  if (vars.data[filter].length) {
    for (let di = 0; di < vars.data[filter].length; di++) {
      const f = vars.data[filter][di];
      const vals = vars[f][filter].value.slice(0);
      vals.unshift(f);
      vals.unshift(filter);
      cacheID = cacheID.concat(vals);
    }
  }

  if (vars.axes && vars.axes.discrete) {
    cacheID.push(vars.axes.discrete);
  }

  cacheID = cacheID.join('_');
  vars.data.cacheID = cacheID;

  for (let c = 0; c < cacheKeys.length; c++) {
    const matchKey = cacheKeys[c]
      .split('_')
      .slice(1)
      .join('_');

    if (matchKey === cacheID) {
      cacheID = new Date().getTime() + '_' + cacheID;
      vars.data.cache[cacheID] = vars.data.cache[cacheKeys[c]];
      delete vars.data.cache[cacheKeys[c]];
      break;
    }
  }

  let returnData;

  if (vars.data.cache[cacheID]) {
    if (vars.dev.value) {
      print.comment('data already cached');
    }

    returnData = vars.data.cache[cacheID].data;
    if ('nodes' in vars) {
      vars.nodes.restricted = vars.data.cache[cacheID].nodes;
      vars.edges.restricted = vars.data.cache[cacheID].edges;
    }

    if (typeof vizFilter === 'function') {
      returnData = vizFilter(vars, returnData);
    }

    return returnData;
  } else {
    let missing = [];
    returnData = [];

    if (vars.data.value && vars.data.value.length) {
      for (let yz = 0; yz < years.length; yz++) {
        const year = years[yz];
        if (vars.data.nested[year]) {
          returnData = returnData.concat(vars.data.nested[year][nestLevel]);
        } else {
          missing.push(year);
        }
      }
    }

    if (returnData.length === 0 && missing.length && !vars.error.internal) {
      if (missing.length > 1) {
        missing = d3.extent(missing);
      }

      missing = missing.map(m => vars.data.time.format(new Date(m)));
      missing = missing.join(' - ');

      const str = vars.format.locale.value.error.dataYear;
      const and = vars.format.locale.value.ui.and;
      missing = stringList(missing, and);
      vars.error.internal = stringFormat(str, missing);
      vars.time.missing = true;
    } else {
      if (vars.time) {
        vars.time.missing = false;
      }

      if (years.length > 1) {
        let separated = false;
        ['x', 'y', 'x2', 'y2'].forEach(a => {
          if (
            vars[a].value === vars.time.value &&
            vars[a].scale.value === 'discrete'
          ) {
            separated = true;
          }
        });

        if (!separated) {
          const nested = vars.id.nesting.slice(0, depth + 1);
          returnData = dataNest(vars, returnData, nested);
        }
      }

      if (!returnData) {
        returnData = [];
      } else {
        returnData = dataFilter(vars, returnData);
      }

      if (cacheKeys.length === 20) {
        cacheKeys.sort();
        delete vars.data.cache[cacheKeys[0]];
      }

      cacheID = new Date().getTime() + '_' + cacheID;
      vars.data.cache[cacheID] = {
        data: returnData
      };
      if ('nodes' in vars) {
        vars.data.cache[cacheID].nodes = vars.nodes.restricted;
        vars.data.cache[cacheID].edges = vars.edges.restricted;
      }

      if (typeof vizFilter === 'function') {
        returnData = vizFilter(vars, returnData);
      }

      if (vars.dev.value) {
        print.comment('storing data in cache');
      }
    }

    return returnData;
  }
};
