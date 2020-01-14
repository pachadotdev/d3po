((() => {
  var browserify;
  var bundler;
  var connect;
  var error;
  var gulp;
  var gutil;
  var notify;
  var path;
  var rebundle;
  var source;
  var test_dir;
  var timer;
  var watcherDone;
  var watchify;

  browserify = require("browserify");

  connect = require("gulp-connect");

  error = require("./error.js");

  gulp = require("gulp");

  notify = require("gulp-notify");

  path = require("path");

  source = require("vinyl-source-stream");

  timer = require("gulp-duration");

  watchify = require("watchify");

  watcherDone = void 0;

  test_dir = "./tests/**/*.*";

  gulp.task("server", done => connect.server({
    livereload: true,
    port: 4000,
    root: path.resolve("./")
  }, function() {
    return this.server.on("close", () => {
      watcherDone();
      return done();
    });
  }));

  rebundle = () => bundler.bundle().on("error", notify.onError(error)).pipe(source("d3po.js")).pipe(gulp.dest("./")).pipe(timer("Total Build Time")).pipe(notify({
    title: "d3po",
    message: "New Build Compiled"
  })).pipe(connect.reload()).on("error", notify.onError(error));

  bundler = watchify(browserify(watchify.args)).add("./src/init.js").on("update", rebundle);

  gulp.task("dev", done => {
    rebundle();
    watcherDone = done;
    return gulp.watch([test_dir], file => {
      var fileName;
      fileName = path.relative("./", file.path);
      gutil.log(gutil.colors.cyan(fileName), "changed");
      return gulp.src(test_dir).pipe(connect.reload());
    });
  });
})).call(this);
