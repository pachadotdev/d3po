// Checks to see if a stylesheet is loaded
(() => {
  let sheet;

  sheet = name => {
    let css;
    let i;
    let returnBoolean;
    let tested;
    tested = sheet.tested;
    if (name in tested) {
      return tested[name];
    }
    i = 0;
    returnBoolean = false;
    while (i < document.styleSheets.length) {
      css = document.styleSheets[i];
      if (css.href && css.href.indexOf(name) >= 0) {
        returnBoolean = true;
        break;
      }
      i++;
    }
    return returnBoolean;
  };

  sheet.tested = {};

  module.exports = sheet;
}).call(this);
