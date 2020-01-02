// Given a single font or a list of font, determines which can be rendered
(function() {
    var fontTester, validate;

    fontTester = require('../core/font/tester.js');

    validate = function(fontList) {
        var completed,
            family,
            font,
            fontString,
            i,
            j,
            len,
            len1,
            monospace,
            proportional,
            testElement,
            testWidth,
            tester,
            valid;
        if (!(fontList instanceof Array)) {
            fontList = fontList.split(',');
        }
        for (i = 0, len = fontList.length; i < len; i++) {
            font = fontList[i];
            font.trim();
        }
        fontString = fontList.join(', ');
        completed = validate.complete;
        if (fontString in completed) {
            return completed[fontString];
        }
        testElement = function(font) {
            return tester
                .append('span')
                .style('font-family', font)
                .style('font-size', '32px')
                .style('padding', '0px')
                .style('margin', '0px')
                .text('abcdefghiABCDEFGHI_!@#$%^&*()_+1234567890');
        };
        testWidth = function(font, control) {
            var elem, width1, width2;
            elem = testElement(font);
            width1 = elem.node().offsetWidth;
            width2 = control.node().offsetWidth;
            elem.remove();
            return width1 !== width2;
        };
        tester = fontTester('div');
        monospace = testElement('monospace');
        proportional = testElement('sans-serif');
        for (j = 0, len1 = fontList.length; j < len1; j++) {
            family = fontList[j];
            valid = testWidth(family + ',monospace', monospace);
            if (!valid) {
                valid = testWidth(family + ',sans-serif', proportional);
            }
            if (valid) {
                valid = family;
                break;
            }
        }
        if (!valid) {
            valid = 'sans-serif';
        }
        monospace.remove();
        proportional.remove();
        completed[fontString] = valid;
        return valid;
    };

    validate.complete = {};

    module.exports = validate;
}.call(this));
