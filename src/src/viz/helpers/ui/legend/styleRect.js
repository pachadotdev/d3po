const dataURL = require('../../../../util/dataurl');
const textColor = require('../../../../color/text');
const stringStrip = require('../../../../string/strip');
const textWrap = require('../../../../textwrap/textwrap');
const validObject = require('../../../../object/validate');
const uniqueValues = require('../../../../util/uniques');
const fetchValue = require('../../../../core/fetch/value');
const fetchColor = require('../../../../core/fetch/color');
const fetchText = require('../../../../core/fetch/text');

module.exports = function styleRect(
  rect,
  square_size,
  vars,
  colorKey,
  colorDepth
) {
  rect
    .attr('width', square_size)
    .attr('height', square_size)
    .attr('fill', function(g) {
      d3.select(this.parentNode)
        .select('text')
        .remove();

      let icon = uniqueValues(g, vars.icon.value, fetchValue, vars, colorKey);

      let color = fetchColor(vars, g, colorKey);

      if (
        vars.legend.icons.value &&
        icon.length === 1 &&
        typeof icon[0] === 'string'
      ) {
        icon = icon[0];
        const short_url = stringStrip(icon + '_' + color);
        const iconStyle = vars.icon.style.value;
        let icon_style;

        const pattern = vars.defs
          .selectAll('pattern#' + short_url)
          .data([short_url]);

        if (typeof iconStyle === 'string') {
          icon_style = vars.icon.style.value;
        } else if (validObject(iconStyle) && iconStyle[colorKey]) {
          icon_style = iconStyle[colorKey];
        } else {
          icon_style = 'default';
        }

        color = icon_style == 'knockout' ? color : 'none';

        pattern
          .select('rect')
          .transition()
          .duration(vars.draw.timing)
          .attr('fill', color)
          .attr('width', square_size)
          .attr('height', square_size);

        pattern
          .select('image')
          .transition()
          .duration(vars.draw.timing)
          .attr('width', square_size)
          .attr('height', square_size);

        const pattern_enter = pattern
          .enter()
          .append('pattern')
          .attr('id', short_url)
          .attr('width', square_size)
          .attr('height', square_size);

        pattern_enter
          .append('rect')
          .attr('fill', color)
          .attr('stroke', 'none')
          .attr('width', square_size)
          .attr('height', square_size);

        pattern_enter
          .append('image')
          .attr('xlink:href', icon)
          .attr('width', square_size)
          .attr('height', square_size)
          .each(() => {
            if (
              icon.indexOf('/') === 0 ||
              icon.indexOf(window.location.hostname) >= 0
            ) {
              dataURL(icon, base64 => {
                pattern.select('image').attr('xlink:href', base64);
              });
            } else {
              pattern.select('image').attr('xlink:href', icon);
            }
          });

        return 'url(#' + short_url + ')';
      } else {
        if (vars.legend.labels.value) {
          let names;
          if (vars.legend.text.value) {
            names = [fetchValue(vars, g, vars.legend.text.value, colorDepth)];
          } else {
            names = fetchText(vars, g, colorDepth);
          }

          if (
            names.length === 1 &&
            !(names[0] instanceof Array) &&
            names[0].length
          ) {
            const text = d3.select(this.parentNode).append('text');
            let size = vars.legend.font.size;

            if (!(size instanceof Array)) {
              size = [size];
            }

            text
              .attr('font-size', size[size.length - 1] + 'px')
              .attr('font-weight', vars.legend.font.weight)
              .attr('font-family', vars.legend.font.family.value)
              .attr('stroke', 'none')
              .attr('fill', textColor(color))
              .attr('x', 0)
              .attr('y', 0)
              .each(function() {
                textWrap()
                  .align('middle')
                  .container(d3.select(this))
                  .height(square_size)
                  .padding(vars.ui.padding)
                  .resize(size.length > 1)
                  .size(size)
                  .text(names[0])
                  .width(square_size)
                  .valign('middle')
                  .draw();
              });

            if (text.select('tspan').empty()) {
              text.remove();
            }
          }
        }

        return color;
      }
    });
};
