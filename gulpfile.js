// ------------------------------------------------------------------
// GET THINGS SET UP
// ------------------------------------------------------------------

    // Include Gulp
var gulp 					= require("gulp"),

    // HTML plugins
    htmlmin                 = require("gulp-htmlmin"),

    // CSS plugins
    sass 					= require("gulp-sass"),
    uncss                   = require("gulp-uncss"),
    glob                    = require('glob'),
    combineMediaQueries 	= require("gulp-combine-media-queries"),
    autoprefixer 			= require("gulp-autoprefixer"),
    cssmin 					= require("gulp-minify-css"),

    // JS plugins
    concat 					= require("gulp-concat"),
    uglify 					= require("gulp-uglify"),

    // Image plugins
    imagemin 				= require("gulp-imagemin"),
    svgmin 					= require("gulp-svgmin"),

    // General plugins
    gutil                   = require("gulp-util"),
    plumber                 = require("gulp-plumber"),
    size                    = require("gulp-size"),
    cp                      + require("child_process"),
    browserSync 			= require("browser-sync"),
    reload                  = browserSync.reload;

// ------------------------------------------------------------------
// TASKS
// ------------------------------------------------------------------

// Build the Jekyll site
gulp.task('jekyll-build', function (done) {
    browserSync.notify('Building Jekyll');
    return cp.spawn('jekyll', ['build'], {stdio: 'inherit'})
        .on('close', done);
});

// Rebuild Jekyll & do page reload
gulp.task('jekyll-rebuild', ['jekyll-build'], function () {
    browserSync.reload();
});

// Wait for `jekyll-build`, then launch the server
gulp.task('browser-sync', ['css', 'jekyll-build'], function() {
    browserSync({
        server: {
            baseDir: "jrdnbwmn.github.io"
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

// Compile files from _scss into both _dist/css (for live injecting) and src/css (for future jekyll builds)
gulp.task('css', function () {    
    return gulp.src("_mysitesrc/_scss/**/*")
        // Prevent gulp.watch from crashing
        .pipe(plumber(onError))
		// Compile Sass
		.pipe(sass({ style: "compressed", noCache: true }))
		// Combine media queries
		.pipe(combineMediaQueries())
		// parse CSS and add vendor-prefixed CSS properties
		.pipe(autoprefixer())
		// Minify CSS
		.pipe(cssmin())
        // Show sizes of minified CSS files
        .pipe(size({ showFiles: true }))
		// Where to store the finalized CSS
		.pipe(gulp.dest("jrdnbwmn.github.io/css"))
        // Also place in `src/css` for future builds
        .pipe(browserSync.reload({stream:true}))
        .pipe(gulp.dest('_mysitesrc/css'));
});
        
// Watch scss files for changes & recompile
// Watch html/md files, run jekyll & reload BrowserSync
gulp.task('watch', function () {
    gulp.watch('_scss/*.scss', ['css']);
    gulp.watch(['index.html', '_layouts/*.html', '_posts/*'], ['jekyll-rebuild']);
});

// Default task, running just `gulp` will compile the sass,
// compile the jekyll site, launch BrowserSync & watch files.
gulp.task('default', ['browser-sync', 'watch']);

// Use default task to launch BrowserSync and watch all files
gulp.task("default", ["browser-sync"], function () {
    // All browsers reload after tasks are complete
    // Watch HTML files
    gulp.watch("src/html/**/*", ["html", reload]);
	// Watch Sass files
  	gulp.watch("src/scss/**/*", ["css", reload]);
  	// Watch JS files
  	gulp.watch("src/js/**/*", ["js", reload]);
  	// Watch image files
  	gulp.watch("src/img/raster/*", ["images", reload]);
  	// Watch SVG files
  	gulp.watch("src/img/vector/*", ["svgs", reload]);
});





















// HTML tasks
gulp.task("html", function() {
	return gulp.src("src/html/**/*")
        // Prevent gulp.watch from crashing
        .pipe(plumber(onError))
        // Minify and improve HTML
        .pipe(htmlmin({
            removeComments: true,
            removeCommentsFromCDATA: true,
            collapseWhitespace: true,
            removeRedundantAttributes: true,
            removeEmptyAttributes: true,
            removeScriptTypeAttributes: true,
            removeStyleLinkTypeAttributes: true,
            caseSensitive: true,
            minifyJS: true,
            minifyCSS: true
        }))
        // Where to store the finalized HTML
        .pipe(gulp.dest("dist"));
});

// Extra CSS task
gulp.task("unusedcss", function() {
	return gulp.src("dist/css/*.css")
        // Prevent gulp.watch from crashing
        .pipe(plumber(onError))
        // Remove any CSS that isn't being used
        .pipe(uncss({
            // Target all the HTML files in the dist directory
			html: glob.sync('dist/**/*.html'),
            // Keep some JS dependent CSS from being deleted,
            // this is an example, configure as needed
			ignore: [ 
				'.js'
			]
		}))
		// Minify CSS
		.pipe(cssmin())
        // Show sizes of minified CSS files
        .pipe(size({ showFiles: true }))
		// Where to store the finalized CSS
		.pipe(gulp.dest("dist/css"));
});

// JS tasks
gulp.task("js", function() {
	return gulp.src("src/js/**/*")
        // Prevent gulp.watch from crashing
        .pipe(plumber(onError))
		// Concatenate all JS files into one
		.pipe(concat("production.js"))
		// Minify JS
		.pipe(uglify())
		// Where to store the finalized JS
		.pipe(gulp.dest("dist/js"));
});

// Image tasks
gulp.task("images", function() {
	return gulp.src("src/img/raster/*")
        // Prevent gulp.watch from crashing
        .pipe(plumber(onError))
		// Minify the images
		.pipe(imagemin())
		// Where to store the finalized images
		.pipe(gulp.dest("dist/img"));
});

// SVG tasks
gulp.task("svgs", function() {
	return gulp.src("src/img/vector/*")
        // Prevent gulp.watch from crashing
        .pipe(plumber(onError))
		// Minify the SVGs
		.pipe(svgmin())
		// Where to store the finalized SVGs
		.pipe(gulp.dest("dist/img"));
});

