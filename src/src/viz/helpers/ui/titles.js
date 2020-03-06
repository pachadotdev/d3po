const events = require('../../../client/pointer.js');
const fetchValue = require('../../../core/fetch/value.js');
const print = require('../../../core/console/print.js');
const rtl = require('../../../client/rtl.js');
const textWrap = require('../../../textwrap/textwrap.js');
//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
// Draws appropriate titles
//------------------------------------------------------------------------------
module.exports = vars => {
  const total_key = vars.size.value
    ? vars.size.value
    : vars.color.type === 'number'
    ? vars.color.value
    : false;

  //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // If there is no data or the title bar is not needed,
  // set the total value to 'null'
  //----------------------------------------------------------------------------
  if (!vars.data.viz || !vars.title.total.value || vars.small) {
    var total = false;
  }
  //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // Otherwise, let's calculate it!
  //----------------------------------------------------------------------------
  else if (total_key) {
    if (vars.dev.value) {
      print.time('calculating total value');
    }

    let total_data = vars.data.pool;
    if (vars.focus.value.length) {
      total_data = vars.data.viz.filter(
        d => d[vars.id.value] == vars.focus.value[0]
      );
    }

    const agg = vars.aggs.value[total_key] || 'sum';
    if (agg.constructor === Function) {
      total = agg(total_data);
    } else {
      total_data = total_data.reduce((arr, d) => {
        const vals = fetchValue(vars, d, total_key);
        if (vals instanceof Array) {
          arr = arr.concat(vals);
        } else {
          arr.push(vals);
        }
        return arr;
      }, []);

      total = d3[agg](total_data);
    }

    if (total === 0 || total === null || total === undefined) {
      total = false;
    }

    if (typeof total === 'number') {
      let pct = '';

      if (
        vars.data.mute.length ||
        vars.data.solo.length ||
        vars.focus.value.length
      ) {
        const overall_total = d3.sum(vars.data.value, d => {
          let match;
          if (vars.time.solo.value.length > 0) {
            match =
              vars.time.solo.value.indexOf(
                fetchValue(vars, d, vars.time.value)
              ) >= 0;
          } else if (vars.time.mute.value.length > 0) {
            match =
              vars.time.solo.value.indexOf(
                fetchValue(vars, d, vars.time.value)
              ) < 0;
          } else {
            match = true;
          }
          if (match) {
            return fetchValue(vars, d, total_key);
          }
        });

        if (overall_total > total) {
          pct = (total / overall_total) * 100;
          const ot = vars.format.value(overall_total, {
            key: vars.size.value,
            vars: vars
          });

          pct =
            ' (' +
            vars.format.value(pct, {
              key: 'share',
              vars: vars
            }) +
            ' ' +
            vars.format.locale.value.dev.of +
            ' ' +
            ot +
            ')';
        }
      }

      total = vars.format.value(total, {
        key: vars.size.value,
        vars: vars
      });
      const obj = vars.title.total.value;

      const prefix =
        obj.prefix ||
        vars.format.value(vars.format.locale.value.ui.total) + ': ';

      total = prefix + total;
      obj.suffix ? (total = total + obj.suffix) : null;
      total += pct;
    }

    if (vars.dev.value) {
      print.timeEnd('calculating total value');
    }
  } else {
    total = false;
  }

  //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // Initialize titles and detect footer
  //----------------------------------------------------------------------------
  const title_data = [];

  if (vars.footer.value) {
    title_data.push({
      link: vars.footer.link,
      style: vars.footer,
      type: 'footer',
      value: vars.footer.value
    });
  }

  //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // If not in "small" mode, detect titles available
  //----------------------------------------------------------------------------
  if (!vars.small) {
    if (vars.title.value) {
      var title = vars.title.value;
      if (typeof title === 'function') {
        title = title(vars.self);
      }
      title_data.push({
        link: vars.title.link,
        style: vars.title,
        type: 'title',
        value: title
      });
    }
    if (vars.title.sub.value) {
      title = vars.title.sub.value;
      if (typeof title === 'function') {
        title = title(vars.self);
      }
      title_data.push({
        link: vars.title.sub.link,
        style: vars.title.sub,
        type: 'sub',
        value: title
      });
    }
    if (vars.title.total.value && total) {
      title_data.push({
        link: vars.title.total.link,
        style: vars.title.total,
        type: 'total',
        value: total
      });
    }
  }

  //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // Enter Titles
  //----------------------------------------------------------------------------
  function style(title) {
    title
      .attr('font-size', t => t.style.font.size)
      .attr('fill', t => (t.link ? vars.links.font.color : t.style.font.color))
      .attr('font-family', t =>
        t.link ? vars.links.font.family.value : t.style.font.family.value
      )
      .attr('font-weight', t =>
        t.link ? vars.links.font.weight : t.style.font.weight
      )
      .style('text-decoration', t =>
        t.link
          ? vars.links.font.decoration.value
          : t.style.font.decoration.value
      )
      .style('text-transform', t =>
        t.link ? vars.links.font.transform.value : t.style.font.transform.value
      );
  }

  //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // Enter Titles
  //----------------------------------------------------------------------------
  if (vars.dev.value) {
    print.time('drawing titles');
  }
  const titles = vars.svg
    .selectAll('g.d3po_title')
    .data(title_data, t => t.type);

  const titleWidth =
    vars.title.width || vars.width.value - vars.margin.left - vars.margin.right;

  titles
    .enter()
    .append('g')
    .attr('class', t => 'd3po_title ' + t.type)
    .attr('opacity', 0)
    .append('text')
    .attr('stroke', 'none')
    .call(style);

  //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // Wrap text and calculate positions, then transition style and opacity
  //----------------------------------------------------------------------------
  function getAlign(d) {
    const align = d.style.font.align;
    if (align == 'center') {
      return 'middle';
    } else if ((align == 'left' && !rtl) || (align == 'right' && rtl)) {
      return 'start';
    } else if ((align == 'left' && rtl) || (align == 'right' && !rtl)) {
      return 'end';
    }
    return align;
  }
  titles
    .each(function(d) {
      const container = d3
        .select(this)
        .select('text')
        .call(style);

      const align = getAlign(d);

      textWrap()
        .align(align)
        .container(container)
        .height(vars.height.value / 2)
        .size(false)
        .text(d.value)
        .width(titleWidth)
        .draw();

      d.y = vars.margin[d.style.position];
      vars.margin[d.style.position] +=
        this.getBBox().height + d.style.padding * 2;
    })
    .on(events.over, function(t) {
      if (t.link) {
        d3.select(this)
          .transition()
          .duration(vars.timing.mouseevents)
          .style('cursor', 'pointer')
          .select('text')
          .attr('fill', vars.links.hover.color)
          .attr('font-family', vars.links.hover.family.value)
          .attr('font-weight', vars.links.hover.weight)
          .style('text-decoration', vars.links.hover.decoration.value)
          .style('text-transform', vars.links.hover.transform.value);
      }
    })
    .on(events.out, function(t) {
      if (t.link) {
        d3.select(this)
          .transition()
          .duration(vars.timing.mouseevents)
          .style('cursor', 'auto')
          .select('text')
          .call(style);
      }
    })
    .on(events.click, t => {
      if (t.link) {
        const target = t.link.charAt(0) != '/' ? '_blank' : '_self';
        window.open(t.link, target);
      }
    })
    .attr('opacity', 1)
    .attr('transform', function(t) {
      const pos = t.style.position;
      let y = pos == 'top' ? 0 + t.y : vars.height.value - t.y;
      if (pos == 'bottom') {
        y -= this.getBBox().height + t.style.padding;
      } else {
        y += t.style.padding;
      }
      const align = getAlign(t);
      if (align === 'start') {
        var x = vars.margin.left + vars.title.padding;
      } else {
        if (align === 'middle') {
          x = vars.width.value / 2 - titleWidth / 2;
        } else {
          x =
            vars.width.value -
            titleWidth -
            vars.margin.right -
            vars.title.padding;
        }
      }
      return 'translate(' + x + ',' + y + ')';
    });

  //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // Exit unused titles
  //----------------------------------------------------------------------------
  titles
    .exit()
    .transition()
    .duration(vars.draw.timing)
    .attr('opacity', 0)
    .remove();

  if (vars.margin.top > 0) {
    vars.margin.top += vars.title.padding;
  }

  if (vars.margin.bottom > 0) {
    vars.margin.bottom += vars.title.padding;
  }

  const min = vars.title.height;
  if (min && vars.margin[vars.title.position] < min) {
    vars.margin[vars.title.position] = min;
  }

  if (vars.dev.value) {
    print.timeEnd('drawing titles');
  }
};
