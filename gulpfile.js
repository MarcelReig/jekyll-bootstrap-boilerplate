/*
 *
 * Gulp tasks for Jekyll + Bootstrap starter theme
 *
 * Table of contents:
 *   1. Fonts
 *   2. Styles
 *   3. Scripts
 *   4. Images
 *   5. Jekyll
 *   6. Local Server
 *   7  Run all in order
 *   8. Watch
 *   9. Default & production tasks
 *
 */

// Define variables
const gulp = require("gulp");
const sass = require("gulp-sass");
const uglify = require("gulp-uglify");
const pump = require("pump");
const order = require("gulp-order");
const concat = require("gulp-concat");
const autoprefixer = require("gulp-autoprefixer");
const shell = require("gulp-shell");
const browserSync = require("browser-sync").create();
const gutil = require("gulp-util");
const imagemin = require("gulp-imagemin");
const del = require("del");
const cache = require("gulp-cache");
const newer = require("gulp-newer");

// Config
const config = {
  sassPaths: ["node_modules"],
  production: gutil.env.environment === "production"
};

// -----------------------------------------------------------------------------
//   1: Fonts
// -----------------------------------------------------------------------------

function build_fonts() {
  return gulp
    .src("./_assets/fonts/*.{woff,woff2,eot,svg,ttf}")
    .pipe(gulp.dest("./assets/fonts"));
}

// -----------------------------------------------------------------------------
//  2: Styles
// -----------------------------------------------------------------------------

function build_styles() {
  console.log("Compiling Sass");
  console.log("config.production:" + config.production);
  if (config.production) {
    return gulp
      .src("./_assets/styles/main.scss")
      .pipe(
        sass({
          includePaths: config.sassPaths,
          outputStyle: "compressed" // if css compressed **file size**
        }).on("error", sass.logError)
      )
      .pipe(
        autoprefixer({
          browsers: ["last 2 versions", "ie >= 9"]
        })
      )
      .pipe(gulp.dest("./assets/styles"))
      .pipe(gulp.dest("./_site/assets/styles"));
  } else {
    return gulp
      .src("./_assets/styles/main.scss")
      .pipe(
        sass({
          includePaths: config.sassPaths,
          outputStyle: "expanded" // if css compressed **file size**
        }).on("error", sass.logError)
      )
      .pipe(
        autoprefixer({
          browsers: ["last 2 versions", "ie >= 9"]
        })
      )
      .pipe(gulp.dest("./assets/styles"))
      .pipe(gulp.dest("./_site/assets/styles"))
      .pipe(
        browserSync.reload({
          stream: true
        })
      );
  }
}

// -----------------------------------------------------------------------------
//   3: Scripts with pump
// -----------------------------------------------------------------------------

function build_scripts(done) {
  console.log("Compiling Scripts");
  if (config.production) {
    pump([
      gulp.src([
        "./_assets/scripts/**/*.js",
        "./node_modules/jquery/dist/jquery.min.js",
        "./node_modules/jquery-validation/dist/jquery.validate.js",
        "./node_modules/popper.js/dist/umd/popper.min.js",
        "./node_modules/bootstrap/dist/js/bootstrap.min.js"
      ]),
      order(
        [
          "node_modules/jquery/dist/jquery.min.js",
          "node_modules/jquery-validation/dist/jquery.validate.js",
          "node_modules/popper.js/dist/umd/popper.min.js",
          "node_modules/bootstrap/dist/js/bootstrap.min.js",
          "webservices.js",
          "main.js"
        ],
        {
          base: "./"
        }
      ),
      concat("app.js"),
      uglify(),
      gulp.dest("./assets/scripts")
    ]);
    done();
  } else {
    pump([
      gulp.src([
        "./_assets/scripts/**/*.js",
        "./node_modules/jquery/dist/jquery.js",
        "./node_modules/jquery-validation/dist/jquery.validate.js",
        "./node_modules/popper.js/dist/umd/popper.js",
        "./node_modules/bootstrap/dist/js/bootstrap.js"
      ]),
      order(
        [
          "node_modules/jquery/dist/jquery.js",
          "node_modules/jquery-validation/dist/jquery.validate.js",
          "node_modules/popper.js/dist/umd/popper.js",
          "node_modules/bootstrap/dist/js/bootstrap.js",
          "webservices.js",
          "main.js"
        ],
        {
          base: "./"
        }
      ),
      concat("app.js"),
      gulp.dest("./assets/scripts"),
      gulp.dest("./_site/assets/scripts"),
      browserSync.reload({
        stream: true
      })
    ]);
    done();
  }
}

// -----------------------------------------------------------------------------
//   4: Images
// -----------------------------------------------------------------------------

function build_images() {
  // Construccion JEKYLL
  return (
    gulp
      .src("./_assets/images/**/*.+(jpg|JPG|jpeg|JPEG|png|PNG|svg|SVG)")
      // Caching images that ran through imagemin
      .pipe(
        cache(
          imagemin([
            imagemin.gifsicle({
              interlaced: true
            }),
            imagemin.jpegtran({
              progressive: true
            }),
            imagemin.optipng({
              optimizationLevel: 5
            }),
            imagemin.svgo({
              plugins: [
                {
                  removeViewBox: true
                },
                {
                  cleanupIDs: false
                }
              ]
            })
          ])
        )
      )
      .pipe(gulp.dest("./assets/images"))
  );
}
// WATCH : Actualizacion
function sync_images() {
  return gulp
    .src("./_assets/images/**/*.+(jpg|JPG|jpeg|JPEG|png|PNG|svg|SVG)")
    .pipe(newer("./assets/images"))
    .pipe(gulp.dest("./assets/images"))
    .pipe(gulp.dest("./_site/assets/images"))
    .pipe(browserSync.stream());
}

// -----------------------------------------------------------------------------
//   5: Jekyll
// -----------------------------------------------------------------------------

function build_jekyll() {
  if (config.production) {
    return gulp
      .src("index.html", {
        read: false
      })
      .pipe(
        shell([
          "JEKYLL_ENV=production bundle exec jekyll build --config _config.yml"
        ])
      )
      .on("error", gutil.log);
  } else {
    return gulp
      .src("index.html", {
        read: false
      })
      .pipe(
        shell([
          'bundle exec jekyll build --drafts  --config "_config.yml,_config_localhost.yml"'
        ])
      )
      .on("error", gutil.log);
  }
}

// Deletes the entire _site directory.
function clean_jekyll() {
  return del(["./_site"]);
}

// Deletes the procesed assets directory.
function clean_assets() {
  return del(["./assets"]);
}

const clean_all = gulp.series(
  clean_jekyll,
  clean_assets
)

// -----------------------------------------------------------------------------
//   6: Localhost Server for development
// -----------------------------------------------------------------------------

function build_localServer() {
  console.log("BrowserSync setting up the server in port 4000");
  browserSync.init({
    port: 4000,
    server: {
      baseDir: "./_site/"
    }
  });
}

// reloading browsers
function browsersync_reload(done) {
  browserSync.reload();
  done();
}

// -----------------------------------------------------------------------------
//   7: Run all in order
// -----------------------------------------------------------------------------

const build_all = gulp.series(
  build_images,
  build_fonts,
  build_scripts,
  build_styles,
  build_jekyll,
  build_localServer
);

// -----------------------------------------------------------------------------
//   8: Watch
// -----------------------------------------------------------------------------

function watchFiles() {
  console.log("watching files for changes");
  gulp.watch("_assets/styles/**/*.scss", build_styles);
  gulp.watch("_assets/scripts/*.js", build_scripts);
  gulp.watch(
    "_assets/images/**/*.+(jpg|JPG|jpeg|JPEG|png|PNG|svg|SVG)",
    gulp.series(sync_images, browsersync_reload)
  );
  gulp.watch(
    ["**/*.+(html|md|markdown|MD)", "!_site/**/*.*"],
    gulp.series(build_jekyll, browsersync_reload)
  );
}

// -----------------------------------------------------------------------------
//   9: Default task
// -----------------------------------------------------------------------------

const build = gulp.series(clean_all, gulp.parallel(build_all, watchFiles));
// For production execute: $ gulp --environment production

// export tasks
exports.default = build;
exports.clean_assets = clean_assets;
exports.clean_jekyll = clean_jekyll;
exports.watch = watchFiles;
