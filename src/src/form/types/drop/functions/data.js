const stringFormat = require('../../../../string/format.js');
const stringStrip = require('../../../../string/strip.js');

//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
// Creates and populates the dropdown list of items.
//------------------------------------------------------------------------------
module.exports = vars => {
  if (vars.data.url && !vars.data.loaded) {
    const loadingObject = {};
    loadingObject[vars.text.value || vars.id.value] = vars.format.value(
      vars.format.locale.value.ui.loading
    );
    vars.data.filtered = [loadingObject];
    vars.data.changed = vars.data.lastFilter !== 'loading';
    vars.data.lastFilter = 'loading';
  } else if (vars.open.value) {
    if (!vars.search.term) {
      vars.data.filtered = vars.data.viz;
      vars.data.changed = vars.data.lastFilter !== 'viz';
      vars.data.lastFilter = 'viz';
      if (
        vars.id.nesting.length > 1 &&
        vars.depth.value < vars.id.nesting.length - 1
      ) {
        vars.data.filtered = vars.data.filtered.filter(d => {
          if ('endPoint' in d.d3po && d.d3po.endPoint === vars.depth.value) {
            d.d3po.icon = false;
          }
          return true;
        });
        vars.data.changed = vars.data.lastFilter !== 'depth';
        vars.data.lastFilter = 'depth';
      }
    } else {
      let searchWords = stringStrip(vars.search.term).split('_');

      let searchKeys = [
        vars.id.value,
        vars.text.value,
        vars.alt.value,
        vars.keywords.value
      ];

      searchKeys = searchKeys.filter(t => t);
      searchWords = searchWords.filter(t => t !== '');

      const startMatches = [];
      const exactMatches = [];
      const softMatches = [];
      let searchData = [];

      vars.id.nesting.forEach(n => {
        searchData = searchData.concat(vars.data.nested.all[n]);
      });

      searchData.forEach(d => {
        let match = false;

        searchKeys.forEach(key => {
          if (!match && key in d && typeof d[key] === 'string') {
            const text = d[key].toLowerCase();

            if (
              [vars.text.value, vars.id.value].indexOf(key) >= 0 &&
              text.indexOf(vars.search.term) === 0
            ) {
              startMatches.push(d);
              match = true;
            } else if (text.indexOf(vars.search.term) >= 0) {
              exactMatches.push(d);
              match = true;
            } else {
              const texts = stringStrip(text).split('_');

              for (const t in texts) {
                if (!match) {
                  for (const s in searchWords) {
                    if (texts[t].indexOf(searchWords[s]) === 0) {
                      softMatches.push(d);
                      match = true;
                      break;
                    }
                  }
                } else {
                  break;
                }
              }
            }
          }
        });
      });

      vars.data.filtered = d3.merge([startMatches, exactMatches, softMatches]);

      vars.data.filtered.forEach((d, i) => {
        d.d3po_order = i;
      });

      vars.data.changed = true;
      vars.data.lastFilter = 'search';

      if (vars.data.filtered.length === 0) {
        const noData = {};
        const str = vars.format.value(vars.format.locale.value.ui.noResults);
        noData[vars.text.value || vars.id.value] = stringFormat(
          str,
          '"' + vars.search.term + '"'
        );
        vars.data.filtered = [noData];
      }
    }
  } else {
    vars.data.filtered = [];
  }
};
