// Tests if a string is a valid color
(() => {
  module.exports = color => {
    let blackColors;
    let testColor;
    let userBlack;
    color = color + '';
    color = color.replace(RegExp(' ', 'g'), '');
    if (color.indexOf('rgb') === 0) {
      color = color
        .split('(')[1]
        .split(')')[0]
        .split(',')
        .slice(0, 3)
        .join(',');
    }
    if (color.indexOf('hsl') === 0) {
      color = color.split(',')[2].split(')')[0];
    }
    testColor = d3.rgb(color).toString();
    blackColors = ['black', '#000', '#000000', '0%', '0,0,0'];
    userBlack = blackColors.indexOf(color) >= 0;
    return testColor !== '#000000' || userBlack;
  };
}).call(this);
