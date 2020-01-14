// Custom styling and behavior for browser console statements
(() => {
  var ie, print, wiki;

  ie = require('../../client/ie.js');

  wiki = require('./wiki.js');

  print = (type, message, style) => {
    style = style || '';
    if (ie || typeof InstallTrigger !== 'undefined') {
      console.log('[ d3po ] ' + message);
    } else if (type.indexOf('group') === 0) {
      console[type](
        '%c[ d3po ]%c ' + message,
        'font-weight: 800;' + 'color: #b35c1e;' + 'margin-left: 0px;',
        'font-weight: 400;' + style
      );
    } else {
      console[type]('%c' + message, style + 'font-weight: 400;');
    }
  };

  print.comment = function(message) {
    this('log', message, 'color:#aaa;');
  };

  print.error = function(message, url) {
    this(
      'groupCollapsed',
      'ERROR: ' + message,
      'font-weight:800;color:#D74B03;'
    );
    this.stack();
    this.wiki(url);
    this.groupEnd();
  };

  print.group = function(message) {
    this('group', message, 'color:#888;');
  };

  print.groupCollapsed = function(message) {
    this('groupCollapsed', message, 'color:#888;');
  };

  print.groupEnd = () => {
    if (!ie) {
      console.groupEnd();
    }
  };

  print.log = function(message) {
    this('log', message, 'color:#444444;');
  };

  print.stack = function() {
    var err, line, message, page, splitter, stack, url;
    if (!ie) {
      err = new Error();
      if (err.stack) {
        stack = err.stack.split('\n');
        stack = stack.filter(
          e =>
            e.indexOf('Error') !== 0 &&
            e.indexOf('d3po.js:') < 0 &&
            e.indexOf('d3po.min.js:') < 0
        );
        if (stack.length && stack[0].length) {
          splitter = window.chrome ? 'at ' : '@';
          url = stack[0];
          if (url.indexOf(splitter) >= 0) {
            url = url.split(splitter)[1];
          }
          stack = url.split(':');
          if (stack.length === 3) {
            stack.pop();
          }
          line = stack.pop();
          page = stack.join(':').split('/');
          page = page[page.length - 1];
          message = 'line ' + line + ' of ' + page + ': ' + url;
          this('log', message, 'color:#D74B03;');
        }
      }
    }
  };

  print.time = message => {
    if (!ie) {
      console.time(message);
    }
  };

  print.timeEnd = message => {
    if (!ie) {
      console.timeEnd(message);
    }
  };

  print.warning = function(message, url) {
    this('groupCollapsed', message, 'color:#888;');
    this.stack();
    this.wiki(url);
    this.groupEnd();
  };

  print.wiki = function(url) {
    if (url) {
      if (url in wiki) {
        url = d3po.repo + 'wiki/' + wiki[url];
      }
      this('log', 'documentation: ' + url, 'color:#aaa;');
    }
  };

  module.exports = print;
}).call(this);
