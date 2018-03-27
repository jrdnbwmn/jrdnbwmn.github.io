// Get things set up
// -------------------------------------------------------------------
var gulp                    = require('gulp'),

    sass                    = require("gulp-sass"),
    combineMediaQueries     = require("gulp-combine-mq"),
    autoprefixer            = require("gulp-autoprefixer"),
    cssmin                  = require("gulp-clean-css"),

    size                    = require("gulp-size"),
    plumber                 = require("gulp-plumber"),
    cp                      = require('child_process'),
    watch                   = require("gulp-watch"),
    browserSync             = require('browser-sync');

var jekyll                  = process.platform === 'win32' ? 'jekyll.bat' : 'jekyll';

var messages                = {
                                jekyllBuild: '<span style="color: grey">Running:</span> $ jekyll build'
                              };

// Tasks
// -------------------------------------------------------------------
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

// Notify on error with a beep
var onError = function(error) {
    console.log(gutil.colors.red(error.message));
    // https://github.com/floatdrop/gulp-plumber/issues/17
    this.emit("end");
    gutil.beep();
};

// CSS
gulp.task('sass', function () {
    return gulp.src('_sass/main.scss')
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
        // _site/css (for live injecting)
        .pipe(gulp.dest('_site/css'))
        // Reload browsersync
        .pipe(browserSync.reload({stream:true}))
        // Main directory for future builds
        .pipe(gulp.dest('css'));
});

// Watch
gulp.task('watch', function () {
    // Watch scss files
    gulp.watch('_sass/*', ['sass']);
    // Watch image files
    gulp.watch('img/**/*.+(png|jpeg|jpg|gif|svg)', ['images']);
    // Watch HTML/Markdown files
    gulp.watch(['*.html', '_layouts/*.html', '_posts/*', '_includes/*', 'img'], ['jekyll-rebuild']);
});

// Default task, running just `gulp` will compile the sass,
// compile the jekyll site, launch BrowserSync & watch files.
gulp.task('default', ['browser-sync', 'watch']);
