# gulp-duration [![Flattr this!](https://api.flattr.com/button/flattr-badge-large.png)](https://flattr.com/submit/auto?user_id=hughskennedy&url=http://github.com/hughsk/gulp-duration&title=gulp-duration&description=hughsk/gulp-duration%20on%20GitHub&language=en_GB&tags=flattr,github,javascript&category=software)[![experimental](http://hughsk.github.io/stability-badges/dist/experimental.svg)](http://github.com/hughsk/stability-badges) #

Track the duration of parts of your gulp tasks.

Useful, for example, when running a periodic watch-like task but not using
`gulp.watch` or gulp's task dependency system.

![gulp-duration](http://i.imgur.com/8WTnOhs.png)

## Usage ##

[![gulp-duration](https://nodei.co/npm/gulp-duration.png?mini=true)](https://nodei.co/npm/gulp-duration)

### `stream = duration([name])` ###

Creates a new pass-through duration stream. When this stream is closed, it will
log the amount of time since its creation to your terminal.

Optionally, you can pass a `name` to use when logging – defaults to
`gulp-duration`.

### `stream.start` ###

Resets the stream's "start time" to the current time. Use this in your pipeline
to only track the duration after a certain event.

## Example ##

Here's a simple example:

``` javascript
var duration = require('gulp-duration')
var uglify = require('gulp-uglify')
var concat = require('gulp-concat')
var gulp = reuqire('gulp')

gulp.task('interval', function() {
  setInterval(function() {
    gulp.src('./*.js')
      .pipe(concat())
      .pipe(uglify())
      .pipe(duration('rebuilding files'))
      .pipe(gulp.dest('./dist'))
  }, 5000)
})
```

And something a little less trivial:

``` javascript
var source = require('vinyl-source-stream')
var uglify = require('gulp-uglify')
var watchify = require('watchify')
var gulp = require('gulp')

gulp.task('example', function() {
  var bundler = watchify({
    entries: ['./index.js']
  }).on('update', rebundle)

  return rebundle()

  function rebundle() {
    var uglifyTimer = duration('uglify time')
    var bundleTimer = duration('bundle time')

    return bundler.bundle()
      .pipe(source('bundle.js'))
      .pipe(bundleTimer)
      // start just before uglify recieves its first file
      .once('data', uglifyTimer.start)
      .pipe(uglify())
      .pipe(uglifyTimer)
      .pipe(gulp.dest('example/'))
  }
})
```

## License ##

MIT. See [LICENSE.md](http://github.com/hughsk/gulp-duration/blob/master/LICENSE.md) for details.
