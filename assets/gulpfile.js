const gulp        = require('gulp');
const gutil       = require('gulp-util');
const concat      = require('gulp-concat');
const rename      = require('gulp-rename');
const uglify      = require('gulp-uglify');
const uglifyCss   = require('gulp-uglifycss');
const sourcify    = require('gulp-sourcemaps');
const babel       = require('gulp-babel');
const browserify  = require('gulp-browserify');
const exec        = require('child_process').exec;
const plumber     = require('gulp-plumber');

var dest        = { };
dest.min        = {};

const srcDir = "src/framework/*.es6";

//script paths
var dependencies = [
                      //@framify_polyfills
                      'src/dependencies/js/framify_polyfill.js'
                      //@ jquery
                      ,'src/dependencies/js/jquery.js'
                      //@ angular and ui router
                      //@ json-formatter
                      // ,'src/dependencies/js/json-formatter.min.js'
                      // //@ angular charts
                      // ,'src/dependencies/js/Chart.js'
                      // ,'src/dependencies/js/angular-chart.js'
                      //@ crypto
                      ,'src/dependencies/js/crypto.js'
                      ,'src/dependencies/js/enc-base64.js'
                      //@ uikit and components
                      // ,'src/dependencies/js/uikit.min.js'  //-- useless DO NOT IMPORT
                      // ,'src/dependencies/js/notify.min.js'
                      //@ ngStorage
                      ,'src/dependencies/js/ngStorage.js'
                      //@ framify-paginate
                      // ,'src/dependencies/js/framify-paginate.js'
                      //@ date-formatter
                      //  ,'src/dependencies/js/date-formatter.min.js'
                      // //@ socket.io
                      // ,'src/dependencies/js/socket.io.js'
                      //@ aria,messages,material,animate
                      ,'src/dependencies/js/angular-aria.min.js'
                      ,'src/dependencies/js/angular-messages.min.js'
                      ,'src/dependencies/js/angular-material.min.js'
                    ];

var bundled = dependencies;

const framework = "src/framework/framify.es6"

var css     = [
                //@UIKIT dependencies
                'src/dependencies/css/uikit.min.css'
                // ,'src/dependencies/css/uikit.almost-flat.min.css'
                // ,'src/dependencies/css/main.min.css'
		            // ,'src/dependencies/css/error_page.css'
                // //@ Chartist css
                // ,'src/dependencies/css/chartist.min.css'
                //@ Font awesome
                ,'src/dependencies/css/font-awesome.min.css'
                //@ JSON formatter
                // ,'src/dependencies/css/json-formatter.min.css'
                //@ Responsive Table
                // ,'src/dependencies/css/table-responsive.css'
                // //@ angular-chart
                // ,'src/dependencies/css/angular-chart.min.css'
                //@ angular-material
                ,'src/dependencies/css/angular-material.min.css'
                ,'www/css/style.css'
              ];

var Main_src   = ['framify.es6'];

dest.css     = "src/dist/css";
dest.js      = "src/dist/js";
dest.min.css = "assets/css";
dest.min.js  = "assets/js";


const paths = {
  es6: ['./src/*.es6']
  ,framework: ['./src/framework/framify.es6']
};
 
gulp.task("es6", function () {
  return gulp.src(paths.es6)
    .pipe(plumber())
    .pipe(babel({presets: ['es2015']}))
    .pipe(gulp.dest("assets/js"));
});
 

gulp.task('minifyjs', function() {
    return gulp.src(dependencies)
        // .pipe( browserify({ insertGlobals: true, debug: true }).on('error', gutil.log) )
        .pipe(sourcify.init())
        .pipe(babel({ presets: ['es2015'] }))
        .pipe(concat('bx_framed.js'))
        .pipe(gulp.dest(dest.js))
        .pipe(rename('bx_framed.min.js'))
        .pipe(uglify())
        .pipe(sourcify.write('maps'))
        .pipe(gulp.dest(dest.min.js));
});


gulp.task('minifycss', function(){
    return gulp.src( css )
        .pipe(concat('bx_framed.css'))
        .pipe(gulp.dest(dest.css))
        .pipe(rename('bx_framed.min.css'))
        .pipe(uglifyCss())
        .pipe(gulp.dest(dest.min.css))
})

gulp.task('framify', function() {
  return gulp.src(framework)
      .pipe(babel({ presets: ['es2015'] }))
      .pipe(concat('framify.js'))
      .pipe(gulp.dest(dest.js))
      .pipe(rename('framify.min.js'))
      .pipe(uglify())
      .pipe(gulp.dest(dest.min.js));
});

let bulk_css = [
  "assets/css/bootstrap.min.css",
  "assets/css/framify_dependencies.min.css",  
  "assets/css/style.min.css",
  "assets/css/picker.css"
]
gulp.task('css',function(){
  return gulp.src( bulk_css )
    .pipe(concat('bulk.min.css'))
    .pipe(gulp.dest(dest.min.css))
})
let bulk_js = [
  "./assets/js/framify_dependencies.min.js",
  "./assets/js/framify.min.js",
  "./assets/js/common.min.js",
  "./assets/js/altair_admin_common.min.js",
  "./assets/js/picker.js",
  "./assets/js/app.js",
  "./assets/js/jspdf.min.js"
];

gulp.task('js',function(){
  return gulp.src(bulk_js)
    .pipe(babel({ presets: ['es2015'] }))
    .pipe(concat('bulk.min.js'))
    .pipe(gulp.dest(dest.min.js))
})

gulp.task('watch', function () {
  gulp.watch( srcDir, ['framify']);
});


gulp.task("bundle",['css','js']);

gulp.task('run', function (cb) {
  exec('ionic cordova run android --release', function (err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    cb(err);
  });
})

gulp.task('build', function (cb) {
  exec('ionic cordova build android --release', function (err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    cb(err);
  });
})

gulp.task('default', ['minifycss','minifyjs','framify','es6']);


gulp.task('deploy', ['framify','run']);