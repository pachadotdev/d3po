// Detects right-to-left text direction on the page
(function() {
    module.exports = d3.select('html').attr('dir') === 'rtl';
}.call(this));
