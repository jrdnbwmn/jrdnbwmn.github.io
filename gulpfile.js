// Get things set up
// -------------------------------------------------------------------
// Include Gulp
var gulp                    = require("gulp"),

    // CSS plugins
    sass                    = require("gulp-sass"),
    combineMediaQueries     = require("gulp-combine-mq"),
    autoprefixer            = require("gulp-autoprefixer"),
    cssmin                  = require("gulp-clean-css")

    // General plugins
    gutil                   = require("gulp-util"),
    plumber                 = require("gulp-plumber"),
    size                    = require("gulp-size"),
    watch                   = require("gulp-watch"),
    browserSync             = require("browser-sync"),
    reload                  = browserSync.reload;

// Tasks
// -------------------------------------------------------------------
// Start server
// Note: Replace `localhost` in the browser URL with your system's
// internal IP (something like 192.168.32.20) and then you'll be able
// to go to that address on multiple devices and all reloading,
// scrolling, clicking, etc will be synced across everything.
gulp.task("browser-sync", function() {
    browserSync({
        server: {
            baseDir: "_site"
        }
    });
});

// Notify on error with a beep
var onError = function(error) {
    console.log(gutil.colors.red(error.message));
    // https://github.com/floatdrop/gulp-plumber/issues/17
    this.emit("end");
    gutil.beep();
};

// CSS task
gulp.task("css", function() {
    return gulp.src("_scss/main.scss")
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
        // Show sizes of minified CSS files
        .pipe(size({ showFiles: true }))
        // Where to store the finalized CSS
        .pipe(gulp.dest("css"));
});

// Use default task to launch BrowserSync and watch all files
gulp.task("default", ["browser-sync"], function () {
    // Watch Sass files
    watch("_scss/*", function () {
        gulp.start('css', reload);
    });
});
