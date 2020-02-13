var gulp = require('gulp');
var clean = require('gulp-clean');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var mq4HoverShim = require('mq4-hover-shim');
var rimraf = require('rimraf').sync;
var browser = require('browser-sync');
var panini = require('panini');
var concat = require('gulp-concat');
var port = process.env.SERVER_PORT || 8080;
var nodepath = 'node_modules/';
var assetspath = 'assets/';

const BUILD_DIR = 'public'

// Starts a BrowerSync instance
gulp.task('server', ['build'], function () {
    browser.init({ server: `./${BUILD_DIR}`, port: port });
});

// Watch files for changes
gulp.task('watch', function () {
    gulp.watch('scss/**/*', ['compile-scss', browser.reload]);
    gulp.watch('sass/**/*', ['compile-sass', browser.reload]);
    gulp.watch('js/**/*', ['copy-js', browser.reload]);
    gulp.watch('images/**/*', ['copy-images', browser.reload]);
    gulp.watch('html/pages/**/*', ['compile-html']);
    gulp.watch(['html/{layouts,includes,helpers,data}/**/*'], ['compile-html:reset', 'compile-html']);
    gulp.watch(['./src/{layouts,partials,helpers,data}/**/*'], [panini.refresh]);
});

// Erases the dist folder
gulp.task('reset', function () {
    rimraf('bulma/*');
    rimraf('scss/*');
    rimraf('assets/css/*');
    rimraf('assets/fonts/*');
    rimraf('images/*');
});

// Erases the dist folder
gulp.task('clean', function () {
    rimraf(BUILD_DIR);
});

// Copy Bulma filed into Bulma development folder
gulp.task('setupBulma', function () {
    //Get Bulma from node modules
    gulp.src([nodepath + 'bulma/*.sass']).pipe(gulp.dest('bulma/'));
    gulp.src([nodepath + 'bulma/**/*.sass']).pipe(gulp.dest('bulma/'));
});

// Copy Bulma extensions Sass into Bulma development folder
gulp.task('extendBulma', function () {
    gulp.src([nodepath + 'bulma-extensions/bulma-divider/dist/bulma-divider.sass']).pipe(gulp.dest('bulma/sass/extensions/'));
    gulp.src([nodepath + 'bulma-extensions/bulma-steps/dist/bulma-steps.sass']).pipe(gulp.dest('bulma/sass/extensions/'));
});

// Copy static assets
gulp.task('copy', function () {
    gulp.src(['assets/css/icons.min.css']).pipe(gulp.dest(`${BUILD_DIR}/assets/css/`));
    //Copy other external font and data assets
    gulp.src(['assets/fonts/**/*']).pipe(gulp.dest(`${BUILD_DIR}/assets/fonts/`));
    gulp.src([nodepath + 'datedropper/dd-icon/**/*']).pipe(gulp.dest(`${BUILD_DIR}/assets/css/dd-icon/`));
    gulp.src([nodepath + 'wickedpicker/fonts/**/*']).pipe(gulp.dest(`${BUILD_DIR}/assets/fonts/`));
    gulp.src([nodepath + 'slick-carousel/slick/fonts/**/*']).pipe(gulp.dest(`${BUILD_DIR}/assets/css/fonts/`));
    gulp.src([nodepath + 'slick-carousel/slick/ajax-loader.gif']).pipe(gulp.dest(`${BUILD_DIR}/assets/css/`));
    gulp.src(['assets/data/**/*']).pipe(gulp.dest(`${BUILD_DIR}/assets/data/`));
});

//Theme Sass variables
var sassOptions = {
    errLogToConsole: true,
    outputStyle: 'compressed',
    includePaths: [nodepath + 'bulma/sass']
};

//Theme Scss variables
var scssOptions = {
    errLogToConsole: true,
    outputStyle: 'compressed',
    includePaths: ['./scss/partials']
};

// Compile Bulma Sass
gulp.task('compile-sass', function () {
    var processors = [
        mq4HoverShim.postprocessorFor({ hoverSelectorPrefix: '.is-true-hover ' }),
        autoprefixer({
            browsers: [
                "Chrome >= 45",
                "Firefox ESR",
                "Edge >= 12",
                "Explorer >= 10",
                "iOS >= 9",
                "Safari >= 9",
                "Android >= 4.4",
                "Opera >= 30"
            ]
        })//,
        //cssnano(),
    ];
    //Watch me get Sassy
    return gulp.src('./bulma/bulma.sass')
        .pipe(sourcemaps.init())
        .pipe(sass(sassOptions).on('error', sass.logError))
        .pipe(postcss(processors))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(`./${BUILD_DIR}/assets/css/`));
});

// Compile Theme Scss
gulp.task('compile-scss', function () {
    var processors = [
        mq4HoverShim.postprocessorFor({ hoverSelectorPrefix: '.is-true-hover ' }),
        autoprefixer({
            browsers: [
                "Chrome >= 45",
                "Firefox ESR",
                "Edge >= 12",
                "Explorer >= 10",
                "iOS >= 9",
                "Safari >= 9",
                "Android >= 4.4",
                "Opera >= 30"
            ]
        })//,
        //cssnano(),
    ];
    //Watch me get Sassy
    return gulp.src('./scss/core_blue.scss')
        .pipe(sourcemaps.init())
        .pipe(sass(sassOptions).on('error', sass.logError))
        .pipe(postcss(processors))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(`./${BUILD_DIR}/assets/css/`));
});

// Compile Html
gulp.task('compile-html', function () {
    gulp.src('html/pages/**/*.html')
        .pipe(panini({
            root: 'html/pages/',
            layouts: 'html/layouts/',
            partials: 'html/includes/',
            helpers: 'html/helpers/',
            data: 'html/data/'
        }))
        .pipe(gulp.dest(BUILD_DIR))
        .on('finish', browser.reload);
});

gulp.task('compile-html:reset', function (done) {
    panini.refresh();
    done();
});

// Compile css from node modules
gulp.task('compile-css', function () {
    return gulp.src([
        nodepath + 'slick-carousel/slick/slick.css',
        nodepath + 'slick-carousel/slick/slick-theme.css',
        //Additional static css assets
        assetspath + 'css/datepicker/datepicker.css',
        assetspath + 'css/chosen/chosen.css',
    ])
        .pipe(concat('app.css'))
        .pipe(gulp.dest(`./${BUILD_DIR}/assets/css/`));
});

// Compile js from node modules
gulp.task('compile-js', function () {
    return gulp.src([
        nodepath + 'jquery/dist/jquery.min.js',
        nodepath + 'slick-carousel/slick/slick.min.js',
        nodepath + 'chosen-js/chosen.jquery.min.js',
        nodepath + 'scrollreveal/dist/scrollreveal.min.js',
        nodepath + 'vivus/dist/vivus.min.js',
        nodepath + 'waypoints/lib/jquery.waypoints.min.js',
        nodepath + 'waypoints/lib/shortcuts/sticky.min.js',
        nodepath + 'jquery.counterup/jquery.counterup.min.js',
        nodepath + '@fengyuanchen/datepicker/dist/datepicker.min.js',
        nodepath + 'paper/dist/paper-full.min.js',
        //Additional static js assets
        assetspath + 'js/ggpopover/ggpopover.min.js',
        assetspath + 'js/ggpopover/ggtooltip.js',
        nodepath + 'bulma-extensions/bulma-steps/dist/bulma-steps.min.js',
        assetspath + 'js/current-device/current-device.js',
    ])
        .pipe(concat('app.js'))
        .pipe(gulp.dest(`./${BUILD_DIR}/assets/js/`));
});

//Copy Theme js to production site
gulp.task('copy-js', function () {
    gulp.src('js/**/*.js')
        .pipe(gulp.dest(`./${BUILD_DIR}/assets/js/`));
});

//Copy images to production site
gulp.task('copy-images', function () {
    gulp.src('images/**/*')
        .pipe(gulp.dest(`./${BUILD_DIR}/assets/images/`));
});

gulp.task('init', ['setupBulma']);
gulp.task('build', ['clean', 'copy', 'compile-js', 'compile-css', 'copy-js', 'compile-sass', 'compile-scss', 'compile-html', 'copy-images']);
gulp.task('default', ['server', 'watch']);
