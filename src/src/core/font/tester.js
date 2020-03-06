// Creates an invisible test element to populate
(() => {
  module.exports = type => {
    let attrs;
    let styles;
    let tester;
    if (['div', 'svg'].indexOf(type) < 0) {
      type = 'div';
    }
    styles = {
      position: 'absolute',
      left: '-9999px',
      top: '-9999px',
      visibility: 'hidden',
      display: 'block'
    };
    attrs =
      type === 'div'
        ? {}
        : {
            position: 'absolute'
          };
    tester = d3
      .select('body')
      .selectAll(type + '.d3po_tester')
      .data([0]);
    tester
      .enter()
      .append(type)
      .attr('class', 'd3po_tester')
      .style(styles)
      .attr(attrs);
    return tester;
  };
}).call(this);
