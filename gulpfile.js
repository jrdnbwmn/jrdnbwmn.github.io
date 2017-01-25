// Get things set up
// -------------------------------------------------------------------
// Include Gulp
var gulp                    = require("gulp"),

    // CSS plugins
    sass                    = require("gulp-sass"),
    combineMediaQueries     = require("gulp-combine-mq"),
    autoprefixer            = require("gulp-autoprefixer"),
    cssmin                  = require("gulp-clean-css"),
    rename                  = require("gulp-rename"),
    globber                 = require('glob'),

    // JS plugins
    concat                  = require("gulp-concat"),
    uglify                  = require("gulp-uglify"),

    // Image plugin
    imagemin                = require("gulp-imagemin"),

    // General plugins
    gutil                   = require("gulp-util"),
    plumber                 = require("gulp-plumber"),
    size                    = require("gulp-size"),
    watch                   = require("gulp-watch"),
    browserSync             = require("browser-sync"),
    cp                      = require('child_process'),
    reload                  = browserSync.reload;

// Tasks
// -------------------------------------------------------------------
// Build site with browser-sync
var jekyll   = process.platform === 'win32' ? 'jekyll.bat' : 'jekyll';
var messages = {
    jekyllBuild: '<span style="color: grey">Running:</span> $ jekyll build'
};

// Build the Jekyll Site
gulp.task('jekyll-build', function (done) {
    browserSync.notify(messages.jekyllBuild);
    return cp.spawn( jekyll , ['build'], {stdio: 'inherit'})
        .on('close', done);
});

// Rebuild Jekyll & do page reload
gulp.task('jekyll-rebuild', ['jekyll-build'], function () {
    browserSync.reload();
});

// Wait for jekyll-build, then launch the Server
gulp.task('browser-sync', ['sass', 'jekyll-build'], function() {
    browserSync({
        server: {
            baseDir: '_site'
        }
    });
});

// CSS task
gulp.task("css", function() {
    return gulp.src("scss/main.scss")
        // Prevent gulp.watch from crashing
        .pipe(plumber(onError))
        // Compile Sass
        .pipe(sass({ style: "compressed", noCache: true }))

        // Combine media queries
        .pipe(combineMediaQueries())
        // parse CSS and add vendor-prefixed CSS properties
        .pipe(autoprefixer({
            browsers: ["last 2 versions"]
        }))
        // Minify CSS
        .pipe(cssmin())

        // Rename the file
        .pipe(rename("main.css"))
        // Show sizes of minified CSS files
        .pipe(size({ showFiles: true }))
        // Compile into _site/css for live injecting
        .pipe(gulp.dest('_site/css'))
        .pipe(browserSync.reload({stream:true}))
        // Compile into site for future builds
        .pipe(gulp.dest('css'));
});

// Notify on error with a beep
var onError = function(error) {
    console.log(gutil.colors.red(error.message));
    // https://github.com/floatdrop/gulp-plumber/issues/17
    this.emit("end");
    gutil.beep();
};

// Watch
gulp.task('watch', function () {
    // Watch scss files
    gulp.watch('scss/*.scss', ['sass']);
    // Watch html/md files, run jekyll & reload browser-sync
    gulp.watch(['*.html', '_layouts/*.html', '_posts/*'], ['jekyll-rebuild']);
});

// Default task will compile sass and jekyll site, launch browser-sync, & watch
gulp.task('default', ['browser-sync', 'watch']);
