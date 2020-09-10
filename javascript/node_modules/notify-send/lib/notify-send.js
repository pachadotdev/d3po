var exec = require('child_process').exec
  , inspect = require('util').inspect;

exports.version = '0.1.0';

exports.urgency = 'normal';

['low', 'normal', 'critical'].forEach( function (urgency) {
  Object.defineProperty(exports, urgency, {
    get: (function (urgency) {
      return function () {
        var notifier = Object.create(this);
        notifier._urgency = urgency;
        return notifier;
      };
    })(urgency)
  });
});

exports.timeout = function (millis) {
  var notifier = Object.create(this);
  notifier._timeout = millis;
  return notifier;
};

exports.icon = function (image) {
  var notifier = Object.create(this);
  notifier._icon = image;
  return notifier;
};

exports.category = function (category) {
  var notifier = Object.create(this);
  notifier._category = category;
  return notifier;
};

exports.notify = function (summary, body, fn) {
  var args = ['notify-send']
    , urgency = this._urgency
    , timeout = this._timeout
    , icon = this._icon
    , category = this._category;

  if (urgency) args.push('-u ' + urgency);
  if (timeout) args.push('-t ' + timeout);
  if (icon) args.push('-i ' + icon);
  if (category) args.push('-c ' + category);
  
  args.push(inspect(summary));
  if ('function' === typeof body) {
    fn = body;
    body = null;
  }
  if (body) args.push(inspect(body));
  exec(args.join(' '), fn);
};
