var gulp = require("gulp");
require("require-dir")("./gulp");

exports.release = gulp.series("compile");
exports.default = gulp.parallel("server", "dev");
