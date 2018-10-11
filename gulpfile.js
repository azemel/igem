var path = require('path');
var del = require('del');
var gulp = require('gulp');
var sass = require('gulp-sass');
// var concat = require('gulp-concat');


var config = {
  server: {
    root: "release"
  },
//   server: {
//     root: "D:/Environment/Apache/htdocs",
//     scripts: "assets/scripts", 
// 	style: "assets/style",
// 	content: "content",
// 	data: "data"
//   },
  sass: {
    src: ["dev/sass/src/**/*.scss", "dev/sass/src/**/*.sass"],
    bin: "dev/sass/bin",
  },
  static: {
    src: ["dev/images/**/*","dev/js/**/*","dev/html/**/*"],
  }
}


gulp.task("clean-sass", function () {
  return del("**/*", { cwd: config.sass.bin});
});

gulp.task('compile-sass', function () {
  return gulp.src(config.sass.src)
    .pipe(sass({ style: 'nested' }).on('error', sass.logError))
    //.pipe($.autoprefixer())  // defauls to > 1%, last 2 versions, Firefox ESR, Opera 12.1
    .pipe(gulp.dest(config.sass.bin))
    //.pipe(browserSync.reload({stream: true}));
});


gulp.task("clean-server", function () {
  return del(["**/*", "!content", "!content/**/*"], { cwd: config.server.root });
});

gulp.task("publish-static", function () {
  return gulp.src(config.static.src)
    .pipe(gulp.dest(config.server.root));
});

// gulp.task("publish-engine", function () {
//     return gulp.src(config.engine.src)
//       .pipe(gulp.dest(config.server.root));
// });

gulp.task("publish-sass", function () {
  return gulp.src(path.resolve(config.sass.bin, "**/*"))
    .pipe(gulp.dest(config.server.root));
});

gulp.task("sass", gulp.series('clean-sass', 'compile-sass', 'publish-sass'));
gulp.task("static", gulp.series('publish-static'));
// gulp.task("engine", gulp.series('publish-engine'));

gulp.task('watch', function() {
  gulp.watch(config.sass.src, gulp.series('sass'));
  gulp.watch(config.static.src, gulp.series('static'));
  // gulp.watch(config.engine.src, gulp.series('engine'));
});

gulp.task(
  'build',
  gulp.series(
    'clean-server',
    gulp.parallel(
      'static',
      // 'engine'
      'sass'
    )
  )
);


gulp.task('default', gulp.series('build', 'watch'));