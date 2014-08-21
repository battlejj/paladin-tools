var gulp = require('gulp');
var less = require('gulp-less');
var path = require('path');

gulp.task('less', function () {
  var stream = gulp.src('./bower_components/bootstrap/less/bootstrap.less')
    .pipe(less())
    .pipe(gulp.dest('./client/css/'));

  stream.on('error', function(e){
    console.log(e);
  })
});

gulp.task('default', ['less']);