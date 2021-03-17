(function() {
  var browserify, chmod, error, gulp, mergeStream, notify, rename, source, streamify, timer, uglify;

  browserify = require("browserify");

  error = require("./error.js");

  mergeStream = require("merge-stream");

  gulp = require("gulp");

  notify = require("gulp-notify");

  rename = require("gulp-rename");

  source = require("vinyl-source-stream");

  streamify = require("gulp-streamify");

  timer = require("gulp-duration");

  uglify = require("gulp-uglify-es").default;

  chmod = require("gulp-chmod");

  gulp.task("compile", function() {
    var normal;
    normal = browserify(["./src/init.js"]).bundle().on("error", notify.onError(error)).pipe(source("d3po.js")).pipe(chmod(0o644)).pipe(gulp.dest("./")).pipe(rename("d3po.min.js")).pipe(streamify(uglify())).pipe(chmod(0o644)).pipe(gulp.dest("./")).pipe(timer("Total Build Time")).pipe(notify({
      title: "d3po",
      message: "Production Builds Compiled"
    })).on("error", notify.onError(error));
    return mergeStream(normal);
  });

}).call(this);
