notify-send
===========

node.js library for `notify-send`, Ubuntu equivalent of OSX growl

See the [man page](http://man.cx/notify-send) for more information about `notify-send`.

## Installation

    $ npm install notify-send

## Example

```javascript
var growl = require('notify-send');

growl.notify('summary', 'body');

// Specify different urgency levels
growl.low.notify('Announcement', 'Clear skies and sunshine today');
growl.normal.notify('Announcement', 'Meeting in 15 minutes');
growl.critical.notify('Announcement', 'Red Alert!');

// Specify an urgency level only once and re-use it
var low = growl.low;
low.notify('Non-important', 'Some low urgency message');

// You can specify other options
growl.timeout(2000).notify('Timing', "I'm out of here in 2");
growl.icon('/home/nodejs/path/to/icon.png').notify('Incoming', 'sponsored message');
growl.category('nodejs').notify('Release', 'v1.0 released');

// All options are chainable
growl.low.timeout(2000).icon('/home/nodejs/path/to/icon.png').category('nodejs').notify('summary', 'body');

// With minimal syntax, you can re-use all options specified in a chain prior to `notify(summary, body)`
var reusableNotifier = growl.critical.timeout(100);
reusableNotifier('Gmail', '[Subject] Important...');
reusableNotifier('Gmail', '[Subject] RE: Important...');
```
