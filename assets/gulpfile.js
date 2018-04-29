const gulp        = require('gulp');
const concat      = require('gulp-concat');  
const rename      = require('gulp-rename');  
const uglify      = require('gulp-uglify'); 

const babel = require("gulp-babel");
const plumber = require("gulp-plumber");
 
// const linter      = require("gulp-jshint");

const paths = {
  es6: ['./src/*.es6']
  ,framework: ['./src/framework/framify.es6']
};
 
gulp.task('default', ['es6','framify']);
 
gulp.task("es6", function () {
  return gulp.src(paths.es6)
    .pipe(plumber())
    .pipe(babel({presets: ['es2015']}))
    .pipe(gulp.dest("assets/js"));
});
 
//...
 
gulp.task('watch', function() {
  gulp.watch(paths.es6, ['es6','framify']);
});

gulp.task('framify', function() {  
    return gulp.src(paths.framework)
        .pipe(babel({ presets: ['es2015'] }))
        .pipe(concat('framify.js'))
        .pipe(gulp.dest('assets/js'))
        .pipe(rename('framify.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('assets/js'));
});

// gulp.task('lint',()=>
//   gulp.src(  paths.framework.concat(paths.es6) )
//   .pipe(linter())
//   .pipe(linter.reporter())
// );