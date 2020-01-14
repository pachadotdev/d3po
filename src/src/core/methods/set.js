// Sets a method's value
(() => {
  var copy,
    d3selection,
    mergeObject,
    print,
    process,
    rejected,
    stringFormat,
    updateArray,
    validObject;

  copy = require('../../util/copy.js');

  d3selection = require('../../util/d3selection.js');

  validObject = require('../../object/validate.js');

  mergeObject = require('../../object/merge.js');

  print = require('../console/print.js');

  process = require('./process/detect.js');

  rejected = require('./rejected.js');

  stringFormat = require('../../string/format.js');

  updateArray = require('../../array/update.js');

  module.exports = (vars, method, object, key, value) => {
    var accepted,
      c,
      callback,
      d3object,
      hasValue,
      id,
      k,
      longArray,
      n,
      parentKey,
      str,
      text,
      typeFunction,
      valString;
    if (key === 'value' || !key || key === method) {
      text = '.' + method + '()';
    } else {
      text =
        '"' +
        key +
        '" ' +
        vars.format.locale.value.dev.of +
        ' .' +
        method +
        '()';
    }
    if (key === 'value' && 'accepted' in object) {
      accepted = object.accepted;
    } else if (validObject(object[key]) && 'accepted' in object[key]) {
      accepted = object[key].accepted;
    } else {
      accepted = [value];
    }
    if (!rejected(vars, accepted, value, method, text)) {
      if (validObject(object[key]) && 'value' in object[key]) {
        parentKey = key;
        object = object[key];
        key = 'value';
      }
      if (key === 'value' && 'process' in object) {
        value = process(vars, object, value);
      }
      if (
        !(object[key] instanceof Array) &&
        object[key] === value &&
        value !== void 0
      ) {
        str = vars.format.locale.value.dev.noChange;
        if (vars.dev.value) {
          print.comment(stringFormat(str, text));
        }
      } else {
        object.changed = true;
        if (object.loaded) {
          object.loaded = false;
        }
        if ('history' in vars && method !== 'draw') {
          c = copy(object);
          c.method = method;
          vars.history.chain.push(c);
        }
        object.previous = object[key];
        if ('id' in vars && key === 'value' && 'nesting' in object) {
          if (method !== 'id') {
            if (typeof object.nesting !== 'object') {
              object.nesting = {};
            }
            if (validObject(value)) {
              for (id in value) {
                if (typeof value[id] === 'string') {
                  value[id] = [value[id]];
                }
              }
              object.nesting = mergeObject(object.nesting, value);
              if (!(vars.id.value in object.nesting)) {
                object.nesting[vars.id.value] = value[d3.keys(value)[0]];
              }
            } else if (value instanceof Array) {
              object.nesting[vars.id.value] = value;
            } else {
              object.nesting[vars.id.value] = [value];
            }
            object[key] = object.nesting[vars.id.value][0];
          } else {
            if (value instanceof Array) {
              object.nesting = value;
              if ('depth' in vars && vars.depth.value < value.length) {
                object[key] = value[vars.depth.value];
              } else {
                object[key] = value[0];
                if ('depth' in vars) {
                  vars.depth.value = 0;
                }
              }
            } else {
              object[key] = value;
              object.nesting = [value];
              if ('depth' in vars) {
                vars.depth.value = 0;
              }
            }
          }
        } else if (method === 'depth') {
          if (value >= vars.id.nesting.length) {
            vars.depth.value = vars.id.nesting.length - 1;
          } else if (value < 0) {
            vars.depth.value = 0;
          } else {
            vars.depth.value = value;
          }
          vars.id.value = vars.id.nesting[vars.depth.value];
          if (typeof vars.text.nesting === 'object') {
            n = vars.text.nesting[vars.id.value];
            if (n) {
              vars.text.nesting[vars.id.value] =
                typeof n === 'string' ? [n] : n;
              vars.text.value = n instanceof Array ? n[0] : n;
            }
          }
        } else if (validObject(object[key]) && validObject(value)) {
          object[key] = mergeObject(object[key], value);
        } else {
          object[key] = value;
        }
        if (key === 'value' && object.global) {
          hasValue = object[key].length > 0;
          k = parentKey || key;
          if (
            k in vars &&
            ((hasValue && vars.data[k].indexOf(method) < 0) ||
              (!hasValue && vars.data[k].indexOf(method) >= 0))
          ) {
            vars.data[k] = updateArray(vars.data[k], method);
          }
        }
        if (
          key === 'value' &&
          object.dataFilter &&
          vars.data &&
          vars.data.filters.indexOf(method) < 0
        ) {
          vars.data.filters.push(method);
        }
        if (vars.dev.value && object.changed && object[key] !== void 0) {
          longArray = object[key] instanceof Array && object[key].length > 10;
          d3object = d3selection(object[key]);
          typeFunction = typeof object[key] === 'function';
          valString =
            !longArray && !d3object && !typeFunction
              ? typeof object[key] === 'string'
                ? object[key]
                : JSON.stringify(object[key])
              : null;
          if (valString !== null && valString.length < 260) {
            str = vars.format.locale.value.dev.setLong;
            print.log(stringFormat(str, text, '"' + valString + '"'));
          } else {
            str = vars.format.locale.value.dev.set;
            print.log(stringFormat(str, text));
          }
        }
      }
      if (key === 'value' && object.callback && !object.url) {
        callback =
          typeof object.callback === 'function'
            ? object.callback
            : object.callback.value;
        if (callback) {
          callback(value, vars.self);
        }
      }
    }
  };
}).call(this);
