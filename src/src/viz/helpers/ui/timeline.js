(function() {
  var closest,
    css,
    events,
    fontSizes,
    mix,
    playInterval,
    prefix,
    print,
    textColor,
    timeDetect;

  closest = require('../../../util/closest.js');

  css = require('../../../client/css.js');

  fontSizes = require('../../../font/sizes.js');

  events = require('../../../client/pointer.js');

  mix = require('../../../color/mix.js');

  prefix = require('../../../client/prefix.js');

  print = require('../../../core/console/print.js');

  textColor = require('../../../color/text.js');

  timeDetect = require('../../../core/data/time.js');

  playInterval = false;

  module.exports = function(vars) {
    var availableWidth,
      background,
      brush,
      brushExtent,
      brush_group,
      brushed,
      brushend,
      d,
      end,
      handles,
      i,
      init,
      j,
      labelWidth,
      labels,
      len,
      max_index,
      min,
      min_index,
      oldWidth,
      playButton,
      playIcon,
      playIconChar,
      playIconStyle,
      playStyle,
      playUpdate,
      playbackWidth,
      setYears,
      start,
      start_x,
      step,
      stopPlayback,
      tallEnough,
      text,
      textFill,
      textStyle,
      tickColor,
      tickStep,
      ticks,
      timeFormat,
      timeReturn,
      timelineBox,
      timelineHeight,
      timelineOffset,
      timelineWidth,
      visible,
      x,
      yearHeight,
      yearMS,
      year_ticks,
      years;
    if (
      vars.timeline.value &&
      (!vars.error.internal || !vars.data.missing) &&
      !vars.small &&
      vars.data.time &&
      vars.data.time.values.length > 1
    ) {
      if (vars.dev.value) {
        print.time('drawing timeline');
      }
      textStyle = {
        'font-weight': vars.ui.font.weight,
        'font-family': vars.ui.font.family.value,
        'font-size': vars.ui.font.size + 'px',
        'text-anchor': 'middle'
      };
      years = vars.data.time.ticks.map(function(d) {
        return new Date(d);
      });
      timeReturn = timeDetect(vars, {
        values: years,
        style: textStyle
      });
      visible = timeReturn.values.map(Number);
      timeFormat = timeReturn.format;
      if (vars.time.solo.value.length) {
        init = d3.extent(vars.time.solo.value);
        for (i = j = 0, len = init.length; j < len; i = ++j) {
          d = init[i];
          if (d.constructor !== Date) {
            d += '';
            if (d.length === 4 && parseInt(d) + '' === d) {
              d += '/01/01';
            }
            d = new Date(d);
            init[i] = d;
          }
        }
      } else {
        init = d3.extent(years);
      }
      year_ticks = years.slice();
      yearHeight = d3.max(
        timeReturn.sizes.map(function(t) {
          return t.height;
        })
      );
      labelWidth =
        ~~d3.max(
          timeReturn.sizes.map(function(t) {
            return t.width;
          })
        ) + 1;
      labelWidth += vars.ui.padding * 2;
      timelineHeight =
        vars.timeline.height.value || yearHeight + vars.ui.padding * 2;
      timelineWidth = labelWidth * years.length;
      playbackWidth = timelineHeight;
      tallEnough = timelineHeight - vars.ui.padding * 2 >= yearHeight;
      availableWidth = vars.width.value - vars.ui.padding * 2;
      if (tallEnough && vars.timeline.play.value) {
        availableWidth -= playbackWidth + vars.ui.padding;
      }
      if (
        !tallEnough ||
        visible.length < years.length ||
        availableWidth < labelWidth * visible.length
      ) {
        oldWidth = labelWidth;
        labelWidth = (availableWidth - labelWidth) / years.length;
        timelineWidth = labelWidth * years.length;
        timelineOffset = 1;
        tickStep = ~~(oldWidth / (timelineWidth / visible.length)) + 1;
        while (tickStep < visible.length - 1) {
          if ((visible.length - 1) % tickStep === 0) {
            break;
          }
          tickStep++;
        }
        visible = visible.filter(function(t, i) {
          return i % tickStep === 0;
        });
      } else {
        timelineOffset = 0;
        min = new Date(years[0]);
        step = vars.data.time.stepType;
        min['set' + step](min['get' + step]() + years.length);
        year_ticks.push(min);
      }
      start = new Date(init[0]);
      start = closest(year_ticks, start);
      end = new Date(init[1]);
      if (!timelineOffset) {
        end['set' + vars.data.time.stepType](
          end['get' + vars.data.time.stepType]() + 1
        );
      }
      end = closest(year_ticks, end);
      yearMS = year_ticks.map(Number);
      min_index = yearMS.indexOf(+start);
      max_index = yearMS.indexOf(+end);
      brushExtent = [start, end];
      if (vars.timeline.align === 'start') {
        start_x = vars.ui.padding;
      } else if (vars.timeline.align === 'end') {
        start_x = vars.width.value - vars.ui.padding - timelineWidth;
      } else {
        start_x = vars.width.value / 2 - timelineWidth / 2;
      }
      if (tallEnough && vars.timeline.play.value) {
        start_x += (playbackWidth + vars.ui.padding) / 2;
      }
      stopPlayback = function() {
        clearInterval(playInterval);
        playInterval = false;
        return playIcon.call(playIconChar, 'icon');
      };
      brushed = function() {
        var extent, max_val, min_val;
        if (d3.event.sourceEvent !== null) {
          if (playInterval) {
            stopPlayback();
          }
          brushExtent = brush.extent();
          min_val = closest(year_ticks, brushExtent[0]);
          max_val = closest(year_ticks, brushExtent[1]);
          if (min_val === max_val) {
            min_index = yearMS.indexOf(+min_val);
            if (min_val < brushExtent[0] || min_index === 0) {
              max_val = year_ticks[min_index + 1];
            } else {
              min_val = year_ticks[min_index - 1];
            }
          }
          min_index = yearMS.indexOf(+min_val);
          max_index = yearMS.indexOf(+max_val);
          if (max_index - min_index >= 1) {
            extent = [min_val, max_val];
          } else if (min_index + 1 <= years.length) {
            extent = [min_val, year_ticks[min_index + 1]];
          } else {
            extent = [min_val];
            i = 1;
            while (i <= 1) {
              if (min_index + i <= years.length) {
                extent.push(year_ticks[min_index + i]);
              } else {
                extent.unshift(
                  year_ticks[min_index - (min_index + i - years.length)]
                );
              }
              i++;
            }
            extent = [extent[0], extent[extent.length - 1]];
          }
          brushExtent = extent;
          text.attr('fill', textFill);
          return d3.select(this).call(brush.extent(extent));
        }
      };
      setYears = function() {
        var newYears;
        if (max_index - min_index === years.length - timelineOffset) {
          newYears = [];
        } else {
          newYears = yearMS.filter(function(t, i) {
            return i >= min_index && i < max_index + timelineOffset;
          });
          newYears = newYears.map(function(t) {
            return new Date(t);
          });
        }
        playUpdate();
        return vars.self
          .time({
            solo: newYears
          })
          .draw();
      };
      brushend = function() {
        var change, old_max, old_min, solo;
        if (d3.event.sourceEvent !== null) {
          if (vars.time.solo.value.length) {
            solo = d3.extent(vars.time.solo.value);
            old_min = yearMS.indexOf(+closest(year_ticks, solo[0]));
            old_max = yearMS.indexOf(+closest(year_ticks, solo[1]));
            change = old_min !== min_index || old_max !== max_index;
          } else {
            change = max_index - min_index !== years.length - timelineOffset;
          }
          if (change) {
            return setYears();
          }
        }
      };
      playButton = vars.g.timeline
        .selectAll('rect.d3po_timeline_play')
        .data(tallEnough && vars.timeline.play.value ? [0] : []);
      playStyle = function(btn) {
        return btn
          .attr('width', playbackWidth + 1)
          .attr('height', timelineHeight + 1)
          .attr('fill', vars.ui.color.primary.value)
          .attr('stroke', vars.ui.color.primary.value)
          .attr('stroke-width', 1)
          .attr('x', start_x - playbackWidth - 1 - vars.ui.padding)
          .attr('y', vars.ui.padding);
      };
      playButton
        .enter()
        .append('rect')
        .attr('class', 'd3po_timeline_play')
        .attr('shape-rendering', 'crispEdges')
        .attr('opacity', 0)
        .call(playStyle);
      playButton
        .transition()
        .duration(vars.draw.timing)
        .call(playStyle);
      playButton
        .exit()
        .transition()
        .duration(vars.draw.timing)
        .attr('opacity', 0)
        .remove();
      playIcon = vars.g.timeline
        .selectAll('text.d3po_timeline_playIcon')
        .data(tallEnough && vars.timeline.play.value ? [0] : []);
      playIconChar = function(text, char) {
        var font;
        char = vars.timeline.play[char];
        if (css('font-awesome')) {
          char = char.awesome;
          font = 'FontAwesome';
        } else {
          char = char.fallback;
          font = 'inherit';
        }
        return text.style('font-family', font).text(char);
      };
      playIconStyle = function(text) {
        var y;
        y = timelineHeight / 2 + vars.ui.padding + 1;
        return text
          .attr('fill', textColor(vars.ui.color.primary.value))
          .attr('stroke', 'none')
          .attr(textStyle)
          .attr('x', start_x - (playbackWidth - 1) / 2 - vars.ui.padding)
          .attr('y', y)
          .attr('dy', '0.5ex')
          .call(playIconChar, playInterval ? 'pause' : 'icon');
      };
      playIcon
        .enter()
        .append('text')
        .attr('class', 'd3po_timeline_playIcon')
        .call(playIconStyle)
        .style('pointer-events', 'none')
        .attr('opacity', 0);
      playIcon
        .call(playIconStyle)
        .transition()
        .duration(vars.draw.timing)
        .attr('opacity', 1);
      playIcon
        .exit()
        .transition()
        .duration(vars.draw.timing)
        .attr('opacity', 0)
        .remove();
      playUpdate = function() {
        if (max_index - min_index === years.length - timelineOffset) {
          playButton
            .on(events.hover, null)
            .on(events.click, null)
            .transition()
            .duration(vars.draw.timing)
            .attr('opacity', 0.3);
          return playIcon
            .transition()
            .duration(vars.draw.timing)
            .attr('opacity', 0.3);
        } else {
          playButton
            .on(events.over, function() {
              return d3.select(this).style('cursor', 'pointer');
            })
            .on(events.out, function() {
              return d3.select(this).style('cursor', 'auto');
            })
            .on(events.click, function() {
              if (playInterval) {
                return stopPlayback();
              } else {
                playIcon.call(playIconChar, 'pause');
                if (max_index === years.length) {
                  max_index = max_index - min_index;
                  min_index = 0;
                } else {
                  min_index++;
                  max_index++;
                }
                setYears();
                return (playInterval = setInterval(function() {
                  if (max_index === years.length - timelineOffset) {
                    return stopPlayback();
                  } else {
                    min_index++;
                    max_index++;
                    return setYears();
                  }
                }, vars.timeline.play.timing.value));
              }
            })
            .transition()
            .duration(vars.draw.timing)
            .attr('opacity', 1);
          return playIcon
            .transition()
            .duration(vars.draw.timing)
            .attr('opacity', 1);
        }
      };
      playUpdate();
      textFill = function(d) {
        var color, less, opacity;
        less = timelineOffset ? d <= brushExtent[1] : d < brushExtent[1];
        if (d >= brushExtent[0] && less) {
          opacity = 1;
          color = textColor(vars.ui.color.secondary.value);
        } else {
          opacity = 0.5;
          color = textColor(vars.ui.color.primary.value);
        }
        if (
          timelineOffset &&
          vars.background.value &&
          vars.background.value !== 'none'
        ) {
          color = d3.rgb(textColor(vars.background.value));
        }
        color = d3.rgb(color);
        return (
          'rgba(' +
          color.r +
          ',' +
          color.g +
          ',' +
          color.b +
          ',' +
          opacity +
          ')'
        );
      };
      background = vars.g.timeline
        .selectAll('rect.d3po_timeline_background')
        .data(['background']);
      background
        .enter()
        .append('rect')
        .attr('class', 'd3po_timeline_background')
        .attr('shape-rendering', 'crispEdges')
        .attr('width', timelineWidth + 2)
        .attr('height', timelineHeight + 2)
        .attr('fill', vars.ui.color.primary.value)
        .attr('x', start_x - 1)
        .attr('y', vars.ui.padding);
      background
        .transition()
        .duration(vars.draw.timing)
        .attr('width', timelineWidth + 2)
        .attr('height', timelineHeight + 2)
        .attr('fill', vars.ui.color.primary.value)
        .attr('x', start_x - 1)
        .attr('y', vars.ui.padding);
      ticks = vars.g.timeline.selectAll('g#ticks').data(['ticks']);
      ticks
        .enter()
        .append('g')
        .attr('id', 'ticks')
        .attr(
          'transform',
          'translate(' + vars.width.value / 2 + ',' + vars.ui.padding + ')'
        );
      brush_group = vars.g.timeline.selectAll('g#brush').data(['brush']);
      brush_group
        .enter()
        .append('g')
        .attr('id', 'brush');
      labels = vars.g.timeline.selectAll('g#labels').data(['labels']);
      labels
        .enter()
        .append('g')
        .attr('id', 'labels');
      text = labels.selectAll('text').data(years, function(d, i) {
        return i;
      });
      text
        .enter()
        .append('text')
        .attr('stroke', 'none')
        .attr('y', 0)
        .attr('dy', '0.5ex')
        .attr('x', 0);
      x = d3.time
        .scale()
        .domain(d3.extent(year_ticks))
        .rangeRound([0, timelineWidth]);
      text
        .order()
        .attr(textStyle)
        .text(function(d, i) {
          if (visible.indexOf(+d) >= 0) {
            return timeFormat(d);
          } else {
            return '';
          }
        })
        .attr('opacity', function(d, i) {
          if (vars.data.time.dataSteps.indexOf(i) >= 0) {
            return 1;
          } else {
            return 0.4;
          }
        })
        .attr('fill', textFill)
        .attr('transform', function(d, i) {
          var dx, dy;
          dx = start_x + x(d);
          if (!timelineOffset) {
            dx += labelWidth / 2;
          }
          dy = timelineHeight / 2 + vars.ui.padding + 1;
          if (timelineOffset) {
            dy += timelineHeight / 2 + yearHeight;
          }
          return 'translate(' + Math.round(dx) + ',' + Math.round(dy) + ')';
        });
      text
        .exit()
        .transition()
        .duration(vars.draw.timing)
        .attr('opacity', 0)
        .remove();
      brush = d3.svg
        .brush()
        .x(x)
        .extent(brushExtent)
        .on('brush', brushed)
        .on('brushend', brushend);
      if (
        vars.axes.discrete &&
        vars[vars.axes.discrete].value === vars.time.value
      ) {
        tickColor = vars[vars.axes.discrete].ticks.color;
      } else {
        tickColor = vars.x.ticks.color;
      }
      ticks
        .attr(
          'transform',
          'translate(' + start_x + ',' + (vars.ui.padding + 1) + ')'
        )
        .transition()
        .duration(vars.draw.timing)
        .call(
          d3.svg
            .axis()
            .scale(x)
            .orient('top')
            .ticks(function() {
              return year_ticks;
            })
            .tickFormat('')
            .tickSize(-timelineHeight)
            .tickPadding(0)
        )
        .selectAll('line')
        .attr('stroke-width', 1)
        .attr('shape-rendering', 'crispEdges')
        .attr('stroke', function(d) {
          if (visible.indexOf(+d) >= 0) {
            return tickColor;
          } else {
            return mix(tickColor, vars.background.value, 0.4, 1);
          }
        });
      ticks.selectAll('path').attr('fill', 'none');
      brush_group
        .attr(
          'transform',
          'translate(' + start_x + ',' + (vars.ui.padding + 1) + ')'
        )
        .attr('opacity', 1)
        .call(brush);
      text.attr('pointer-events', 'none');
      brush_group
        .selectAll('rect.background')
        .attr('fill', 'none')
        .style('visibility', 'visible')
        .attr('height', timelineHeight)
        .attr('shape-rendering', 'crispEdges')
        .on(events.move, function() {
          var c;
          c = vars.timeline.hover.value;
          if (['grab', 'grabbing'].indexOf(c) >= 0) {
            c = prefix() + c;
          }
          return d3.select(this).style('cursor', c);
        });
      brush_group
        .selectAll('rect.extent')
        .attr('opacity', 0.75)
        .attr('height', timelineHeight)
        .attr('fill', vars.ui.color.secondary.value)
        .attr('shape-rendering', 'crispEdges')
        .on(events.move, function() {
          var c;
          c = vars.timeline.hover.value;
          if (['grab', 'grabbing'].indexOf(c) >= 0) {
            c = prefix() + c;
          }
          return d3.select(this).style('cursor', c);
        });
      if (vars.timeline.handles.value) {
        handles = brush_group
          .selectAll('g.resize')
          .selectAll('rect.d3po_handle')
          .data(['d3po_handle']);
        handles
          .enter()
          .insert('rect', 'rect')
          .attr('class', 'd3po_handle');
        handles
          .attr('fill', vars.timeline.handles.color)
          .attr('transform', function(d) {
            var mod;
            if (this.parentNode.className.baseVal === 'resize e') {
              mod = -vars.timeline.handles.size;
            } else {
              mod = 0;
            }
            return 'translate(' + mod + ',0)';
          })
          .attr('width', vars.timeline.handles.size)
          .style('visibility', 'visible')
          .attr('shape-rendering', 'crispEdges')
          .attr('opacity', vars.timeline.handles.opacity);
        brush_group
          .selectAll('g.resize')
          .selectAll('rect')
          .attr('height', timelineHeight);
      } else {
        brush_group.selectAll('g.resize').remove();
      }
      timelineBox = vars.g.timeline.node().getBBox();
      if (vars.margin.bottom === 0) {
        vars.margin.bottom += vars.ui.padding;
      }
      vars.margin.bottom += timelineBox.height + timelineBox.y;
      vars.g.timeline
        .transition()
        .duration(vars.draw.timing)
        .attr(
          'transform',
          'translate(0,' +
            Math.round(
              vars.height.value - vars.margin.bottom - vars.ui.padding / 2
            ) +
            ')'
        );
      vars.margin.bottom += vars.ui.padding;
      if (vars.dev.value) {
        return print.time('drawing timeline');
      }
    } else {
      return vars.g.timeline
        .transition()
        .duration(vars.draw.timing)
        .attr('transform', 'translate(0,' + vars.height.value + ')');
    }
  };
}.call(this));
