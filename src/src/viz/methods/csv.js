(() => {
  var fetchValue, ie, stringStrip;

  fetchValue = require('../../core/fetch/value.js');

  ie = require('../../client/ie.js');

  stringStrip = require('../../string/strip.js');

  module.exports = {
    accepted: [void 0, true, Array, String],
    chainable: false,
    data: [],
    process: function(value, vars) {
      var blob,
        c,
        col,
        columns,
        csv_data,
        csv_to_return,
        d,
        dataString,
        i,
        j,
        k,
        l,
        len,
        len1,
        len2,
        len3,
        len4,
        len5,
        len6,
        len7,
        link,
        m,
        max_filename_len,
        n,
        node,
        o,
        p,
        q,
        ref,
        ref1,
        ref2,
        row,
        title,
        titles,
        url,
        val;
      if (vars.returned === void 0) {
        return [];
      }
      value = value || vars.cols.value;
      if (value instanceof Array) {
        columns = value;
      } else if (typeof value === 'string') {
        columns = [value];
      }
      csv_to_return = [];
      titles = [];
      if (vars.title.value) {
        title = vars.title.value;
        if (typeof title === 'function') {
          title = title(vars.self);
        }
        title = stringStrip(title);
        max_filename_len = 250;
        title = title.substr(0, max_filename_len);
      } else {
        title = 'd3po Visualization Data';
      }
      if (value === true) {
        columns = d3.keys(vars.data.keys);
        csv_to_return.push(columns);
        ref = vars.data.value;
        for (j = 0, len = ref.length; j < len; j++) {
          d = ref[j];
          row = [];
          for (k = 0, len1 = columns.length; k < len1; k++) {
            c = columns[k];
            val = d[c];
            if (vars.data.keys[c] === 'string') {
              val = '"' + val + '"';
            }
            row.push(val);
          }
          csv_to_return.push(row);
        }
      } else {
        if (!columns) {
          columns = [vars.id.value];
          if (vars.time.value) {
            columns.push(vars.time.value);
          }
          if (vars.size.value) {
            columns.push(vars.size.value);
          }
          if (vars.text.value) {
            columns.push(vars.text.value);
          }
        }
        for (l = 0, len2 = columns.length; l < len2; l++) {
          c = columns[l];
          titles.push(vars.format.value(c));
        }
        csv_to_return.push(titles);
        ref1 = vars.returned.nodes;
        for (m = 0, len3 = ref1.length; m < len3; m++) {
          node = ref1[m];
          if (node.values != null && node.values instanceof Array) {
            ref2 = node.values;
            for (n = 0, len4 = ref2.length; n < len4; n++) {
              val = ref2[n];
              row = [];
              for (o = 0, len5 = columns.length; o < len5; o++) {
                col = columns[o];
                val = fetchValue(vars, val, col);
                if (typeof val === 'string') {
                  val = '"' + val + '"';
                }
                row.push(val);
              }
              csv_to_return.push(row);
            }
          } else {
            row = [];
            for (p = 0, len6 = columns.length; p < len6; p++) {
              col = columns[p];
              row.push(fetchValue(vars, node, col));
            }
            csv_to_return.push(row);
          }
        }
      }
      csv_data = '';
      for (i = q = 0, len7 = csv_to_return.length; q < len7; i = ++q) {
        c = csv_to_return[i];
        dataString = c.join(',');
        csv_data += i < csv_to_return.length ? dataString + '\n' : dataString;
      }
      blob = new Blob([csv_data], {
        type: 'text/csv;charset=utf-8;'
      });
      if (ie) {
        navigator.msSaveBlob(blob, title + '.csv');
      } else {
        link = document.createElement('a');
        url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', title + '.csv');
        link.style = 'visibility:hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      this.data = csv_to_return;
      return columns;
    },
    value: void 0
  };
}).call(this);
