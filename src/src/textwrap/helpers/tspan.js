// Flows the text into tspans
(function() {
    var rtl;

    rtl = require('../../client/rtl.js');

    module.exports = function(vars) {
        var anchor,
            dy,
            ellipsis,
            fontSize,
            h,
            height,
            line,
            lineWidth,
            lines,
            mirror,
            newLine,
            placeWord,
            progress,
            reverse,
            rmod,
            rotate,
            rx,
            ry,
            space,
            start,
            textBox,
            translate,
            truncate,
            valign,
            width,
            words,
            wrap,
            x,
            xOffset,
            y,
            yOffset;
        newLine = function(first) {
            var tspan;
            if (!reverse || first) {
                tspan = vars.container.value.append('tspan');
            } else {
                tspan = vars.container.value.insert('tspan', 'tspan');
            }
            return tspan
                .attr('x', x + 'px')
                .attr('dy', dy + 'px')
                .style('baseline-shift', '0%')
                .attr('dominant-baseline', 'alphabetic');
        };
        mirror = vars.rotate.value === -90 || vars.rotate.value === 90;
        width = mirror ? vars.height.inner : vars.width.inner;
        height = mirror ? vars.width.inner : vars.height.inner;
        if (vars.shape.value === 'circle') {
            anchor = 'middle';
        } else {
            anchor = vars.align.value || vars.container.align || 'start';
        }
        if (anchor === 'end' || (anchor === 'start' && rtl)) {
            xOffset = width;
        } else if (anchor === 'middle') {
            xOffset = width / 2;
        } else {
            xOffset = 0;
        }
        valign = vars.valign.value || 'top';
        x = vars.container.x + xOffset;
        fontSize = vars.resize.value
            ? vars.size.value[1]
            : vars.container.fontSize || vars.size.value[0];
        dy = vars.container.dy || fontSize * 1.1;
        textBox = null;
        progress = null;
        words = null;
        reverse = false;
        yOffset = 0;
        if (vars.shape.value === 'circle') {
            if (valign === 'middle') {
                yOffset = (((height / dy) % 1) * dy) / 2;
            } else if (valign === 'end') {
                yOffset = ((height / dy) % 1) * dy;
            }
        }
        vars.container.value
            .attr('text-anchor', anchor)
            .attr('font-size', fontSize + 'px')
            .style('font-size', fontSize + 'px')
            .attr('x', vars.container.x)
            .attr('y', vars.container.y);
        truncate = function() {
            textBox.remove();
            if (reverse) {
                line++;
                textBox = vars.container.value.select('tspan');
            } else {
                line--;
                textBox = d3.select(vars.container.value.node().lastChild);
            }
            if (!textBox.empty()) {
                words = textBox.text().match(/[^\s-]+-?/g);
                return ellipsis();
            }
        };
        lineWidth = function() {
            var b;
            if (vars.shape.value === 'circle') {
                b = (line - 1) * dy + yOffset;
                if (b > height / 2) {
                    b += dy;
                }
                return 2 * Math.sqrt(b * (2 * (width / 2) - b));
            } else {
                return width;
            }
        };
        ellipsis = function() {
            var lastChar, lastWord;
            if (words && words.length) {
                lastWord = words.pop();
                lastChar = lastWord.charAt(lastWord.length - 1);
                if (
                    lastWord.length === 1 &&
          vars.text.split.value.indexOf(lastWord) >= 0
                ) {
                    return ellipsis();
                } else {
                    if (vars.text.split.value.indexOf(lastChar) >= 0) {
                        lastWord = lastWord.substr(0, lastWord.length - 1);
                    }
                    textBox.text(words.join(' ') + ' ' + lastWord + '...');
                    if (textBox.node().getComputedTextLength() > lineWidth()) {
                        return ellipsis();
                    }
                }
            } else {
                return truncate();
            }
        };
        placeWord = function(word) {
            var current, i, joiner, next_char;
            current = textBox.text();
            next_char = '';
            if (reverse) {
                next_char = vars.text.current.charAt(
                    vars.text.current.length - progress.length - 1
                );
                if (next_char === ' ') {
                    joiner = '';
                    i = 2;
                    while (next_char === ' ') {
                        joiner += ' ';
                        next_char = vars.text.current.charAt(
                            vars.text.current.length - progress.length - i
                        );
                        i++;
                    }
                } else {
                    joiner = '';
                }
                progress = word + joiner + progress;
                textBox.text(word + joiner + current);
            } else {
                next_char = vars.text.current.charAt(progress.length);
                if (next_char === ' ') {
                    joiner = '';
                    i = 1;
                    while (next_char === ' ') {
                        joiner += ' ';
                        next_char = vars.text.current.charAt(progress.length + i);
                        i++;
                    }
                } else {
                    joiner = '';
                }
                progress += joiner + word;
                textBox.text(current + joiner + word);
            }
            if (
                Math.floor(textBox.node().getComputedTextLength()) > lineWidth() ||
        next_char === '\n'
            ) {
                textBox.text(current);
                if (current.length) {
                    textBox = newLine();
                }
                textBox.text(word);
                if (reverse) {
                    return line--;
                } else {
                    return line++;
                }
            }
        };
        start = 1;
        line = null;
        lines = null;
        wrap = function() {
            var i, j, len, next_char, unsafe, word;
            vars.container.value.text('').html('');
            words = vars.text.words.slice();
            if (reverse) {
                words.reverse();
            }
            progress = '';
            textBox = newLine(true);
            line = start;
            for (j = 0, len = words.length; j < len; j++) {
                word = words[j];
                if (line * dy > height) {
                    truncate();
                    break;
                }
                placeWord(word);
                unsafe = true;
                while (unsafe) {
                    next_char = vars.text.current.charAt(progress.length);
                    i = 1;
                    while (next_char === ' ') {
                        next_char = vars.text.current.charAt(progress.length + i);
                        i++;
                    }
                    unsafe = vars.text.split.value.indexOf(next_char) >= 0;
                    if (unsafe) {
                        placeWord(next_char);
                    }
                }
            }
            if (line * dy > height) {
                truncate();
            }
            return (lines = Math.abs(line - start) + 1);
        };
        wrap();
        lines = 0;
        vars.container.value.selectAll('tspan').each(function() {
            if (d3.select(this).text().length) {
                return lines++;
            }
        });
        if (vars.shape.value === 'circle') {
            space = height - lines * dy;
            if (space > dy) {
                if (valign === 'middle') {
                    start = ((space / dy / 2) >> 0) + 1;
                    wrap();
                } else if (valign === 'bottom') {
                    reverse = true;
                    start = (height / dy) >> 0;
                    wrap();
                }
            }
        }
        lines = 0;
        vars.container.value.selectAll('tspan').each(function() {
            if (d3.select(this).text().length) {
                return lines++;
            }
        });
        if (valign === 'top') {
            y = 0;
        } else {
            h = lines * dy;
            y = valign === 'middle' ? height / 2 - h / 2 : height - h;
        }
        y -= dy * 0.2;
        translate = 'translate(0,' + y + ')';
        if (vars.rotate.value === 180 || vars.rotate.value === -180) {
            rx = vars.container.x + width / 2;
            ry = vars.container.y + height / 2;
        } else {
            rmod = vars.rotate.value < 0 ? width : height;
            rx = vars.container.x + rmod / 2;
            ry = vars.container.y + rmod / 2;
        }
        rotate = 'rotate(' + vars.rotate.value + ', ' + rx + ', ' + ry + ')';
        return vars.container.value.attr('transform', rotate + translate);
    };
}.call(this));
