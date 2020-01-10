var textColor = require('../../../color/text.js');

//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
// Creates Centered Server Message
//------------------------------------------------------------------------------
module.exports = function(vars, message) {
  message = vars.messages.value ? message : null;

  var size =
    vars.messages.style.value ||
    (message === vars.error.internal ? 'large' : vars.messages.style.backup);

  var font, position;
  if (size === 'large') {
    font = vars.messages;
    position = 'center';
  } else {
    if (vars.footer.value) {
      font = vars.footer;
    } else if (vars.title.value) {
      font = vars.title;
    } else if (vars.title.sub.value) {
      font = vars.title.sub;
    } else if (vars.title.total.value) {
      font = vars.title.total;
    } else {
      font = vars.title.sub;
    }

    position = font.position;
  }

  font = {
    color: font.font.color,
    'font-family': font.font.family.value,
    'font-weight': font.font.weight,
    'font-size': font.font.size + 'px',
    padding: font.padding + 'px'
  };

  var bg = vars.messages.background.value;
  if (!bg) {
    bg = vars.background.value;
    if (bg === 'none' || bg === 'transparent') {
      bg = textColor(font.color);
    }
  }

  function style(elem) {
    elem
      .style(font)
      .style('position', 'absolute')
      .style('background-color', bg)
      .style('text-align', 'center')
      .style('left', function() {
        return position == 'center' ? '50%' : '0px';
      })
      .style('width', function() {
        return position == 'center' ? 'auto' : vars.width.value + 'px';
      })
      .style('margin-left', function() {
        return position == 'center' ? -(this.offsetWidth / 2) + 'px' : '0px';
      })
      .style('top', function() {
        if (position == 'center') {
          return '50%';
        } else if (position == 'top') {
          return '0px';
        } else {
          return 'auto';
        }
      })
      .style('bottom', function() {
        if (position == 'bottom') {
          return '0px';
        } else {
          return 'auto';
        }
      })
      .style('margin-top', function() {
        if (size == 'large') {
          var height = this.offsetHeight || this.getBoundingClientRect().height;
          return -height / 2 + 'px';
        }
        return '0px';
      });
  }

  // Enter Message Group
  vars.g.message = vars.container.value
    .selectAll('div#d3po_message')
    .data(['message']);

  var enter = vars.g.message
    .enter()
    .append('div')
    .attr('id', 'd3po_message')
    .attr('opacity', 0);

  enter
    .append('div')
    .attr('class', 'd3po_message_text')
    .style('display', 'block');

  vars.g.message
    .select('.d3po_message_text')
    .text(message ? message : vars.g.message.text());

  vars.g.message
    .style('display', message ? 'inline-block' : 'none')
    .call(style)
    .style('opacity', message ? 1 : 0);
};
