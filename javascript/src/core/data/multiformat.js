//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
// Custom implementation of deprecated d3.time.format.multi() function
//
// See https://github.com/d3/d3-3.x-api-reference/blob/master/Time-Formatting.md#format_multi
// and https://observablehq.com/@severo/custom-time-format-d3-5-x
//------------------------------------------------------------------------------
module.exports = function(timeFormatLocale, formatsArray) {
    function getFormat(date) {
        let i = 0,
        found = false,
        fmt = "%c";
        while (!found && i < formatsArray.length) {
            found = formatsArray[i][1](date);
            if (found) fmt = formatsArray[i][0];
            i++;
        }
        return fmt;
    }
    return function(date) {
        return timeFormatLocale.format(getFormat(date))(date);
    };
};