browserify = require "browserify"
connect = require "gulp-connect"
error = require "./error.coffee"
gulp = require "gulp"
gutil = require "gulp-util"
notify = require "gulp-notify"
path = require "path"
source = require "vinyl-source-stream"
timer = require "gulp-duration"
watchify = require "watchify"
watcherDone = undefined

test_dir = "./tests/**/*.*"

gulp.task "server", (done) ->

  connect.server
    livereload: true
    port: 4000
    root: path.resolve("./")
    , ->
      this.server.on "close", ->
        watcherDone()
        done()

rebundle = ->
  bundler.bundle()
    .on "error", notify.onError(error)
    .pipe source("d3po.js")
    .pipe gulp.dest("./")
    .pipe timer("Total Build Time")
    .pipe(notify(
      title: "d3po"
      message: "New Build Compiled"
    ))
    .pipe connect.reload()
    .on "error", notify.onError(error)

bundler = watchify(browserify(watchify.args))
  .add "./src/init.coffee"
  .on "update", rebundle

gulp.task "dev", (done) ->
  rebundle()
  watcherDone = done
  gulp.watch [test_dir], (file) ->

    fileName = path.relative("./", file.path)
    gutil.log gutil.colors.cyan(fileName), "changed"

    gulp.src(test_dir).pipe connect.reload()
