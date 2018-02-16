var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var babel = require('gulp-babel');
var maps = require('gulp-sourcemaps');
var gulpSequence = require('gulp-sequence');

gulp.task('build', gulpSequence('build_engineering_flot'));

gulp.task('build_engineering_flot', function() {
    return gulp.src([
        './jquery.colorhelpers.js',
        './jquery.canvaswrapper.js',
        './jquery.flot.js',
        './jquery.flot.saturated.js',
        './jquery.flot.browser.js',
        './jquery.flot.drawSeries.js',
        './jquery.flot.uiConstants.js',
        './jquery.flot.logaxis.js',
        './jquery.flot.symbol.js',
        './jquery.flot.flatdata.js',
        './jquery.flot.navigate.js',
        './jquery.flot.touchNavigate.js',
        './jquery.flot.hover.js',
        './jquery.flot.touch.js',
        './jquery.flot.absRelTime.js',
        './jquery.flot.axislabels.js',
        './jquery.flot.selection.js',
        './jquery.flot.composeImages.js',
        './jquery.flot.legend.js'
        ])
        .pipe(maps.init())
        .pipe(babel({
            presets: ['es2015'],
            plugins: ["external-helpers-2"]
        }))
        .pipe(concat('jquery.flot.min.js'))
        // .pipe(uglify())
        .pipe(maps.write('./'))
        .pipe(gulp.dest('dist/es5-minified'));
});