// Flows the text into the container
(() => {
  var flow, fontSizes, resize, wrap;

  flow = require('./flow.js');

  fontSizes = require('../../font/sizes.js');

  wrap = vars => {
    var firstChar;
    if (vars.text.phrases.length) {
      vars.text.current = vars.text.phrases.shift() + '';
      vars.text.words = vars.text.current.match(vars.text.split['break']);
      firstChar = vars.text.current.charAt(0);
      if (firstChar !== vars.text.words[0].charAt(0)) {
        vars.text.words[0] = firstChar + vars.text.words[0];
      }
      vars.container.value.html('');
      if (vars.resize.value) {
        resize(vars);
      } else {
        flow(vars);
      }
    }
  };

  module.exports = wrap;

  resize = vars => {
    var addon,
      areaMod,
      areaRatio,
      boxArea,
      height,
      heightMax,
      i,
      lineWidth,
      maxWidth,
      mirror,
      sizeMax,
      sizeRatio,
      sizes,
      textArea,
      width,
      widthRatio,
      words;
    words = [];
    i = 0;
    while (i < vars.text.words.length) {
      addon = i === vars.text.words.length - 1 ? '' : ' ';
      words.push(vars.text.words[i] + addon);
      i++;
    }
    mirror = vars.rotate.value === -90 || vars.rotate.value === 90;
    width = mirror ? vars.height.inner : vars.width.inner;
    height = mirror ? vars.width.inner : vars.height.inner;
    sizeMax = Math.floor(vars.size.value[1]);
    lineWidth = vars.shape.value === 'circle' ? width * 0.75 : width;
    sizes = fontSizes(
      words,
      {
        'font-size': sizeMax + 'px'
      },
      {
        parent: vars.container.value
      }
    );
    maxWidth = d3.max(sizes, d => d.width);
    areaMod = 1.165 + (width / height) * 0.11;
    textArea =
      d3.sum(sizes, d => {
        var h;
        h = vars.container.dy || sizeMax * 1.2;
        return d.width * h;
      }) * areaMod;
    if (vars.shape.value === 'circle') {
      boxArea = Math.PI * Math.pow(width / 2, 2);
    } else {
      boxArea = lineWidth * height;
    }
    if (maxWidth > lineWidth || textArea > boxArea) {
      areaRatio = Math.sqrt(boxArea / textArea);
      widthRatio = lineWidth / maxWidth;
      sizeRatio = d3.min([areaRatio, widthRatio]);
      sizeMax = d3.max([vars.size.value[0], Math.floor(sizeMax * sizeRatio)]);
    }
    heightMax = Math.floor(height * 0.8);
    if (sizeMax > heightMax) {
      sizeMax = heightMax;
    }
    if (maxWidth * (sizeMax / vars.size.value[1]) <= lineWidth) {
      if (sizeMax !== vars.size.value[1]) {
        vars.self.size([vars.size.value[0], sizeMax]);
      }
      flow(vars);
    } else {
      wrap(vars);
    }
  };
}).call(this);
