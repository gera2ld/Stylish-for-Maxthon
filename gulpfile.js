const gulp = require('gulp');
const del = require('del');
const log = require('fancy-log');
const gulpFilter = require('gulp-filter');
const uglify = require('gulp-uglify');
const plumber = require('gulp-plumber');
const yaml = require('js-yaml');
const webpack = require('webpack');
const webpackConfig = require('./scripts/webpack.conf');
const i18n = require('./scripts/i18n');
const string = require('./scripts/string');
const bom = require('./scripts/bom');
const { IS_DEV, definitions } = require('./scripts/utils');
const pkg = require('./package.json');

const DIST = 'dist';
const paths = {
  def: 'src/def.yml',
  copy: [
    'src/public/lib/**',
    'src/icons/**',
  ],
  locales: [
    'src/_locales/**',
  ],
  templates: [
    'src/**/*.@(js|html|json|yml|vue)',
  ],
};

function webpackCallback(err, stats) {
  if (err) {
    log('[FATAL]', err);
    return;
  }
  if (stats.hasErrors()) {
    log('[ERROR] webpack compilation failed\n', stats.toJson().errors.join('\n'));
    return;
  }
  if (stats.hasWarnings()) {
    log('[WARNING] webpack compilation has warnings\n', stats.toJson().warnings.join('\n'));
  }
  (Array.isArray(stats.stats) ? stats.stats : [stats])
  .forEach(stat => {
    const timeCost = (stat.endTime - stat.startTime) / 1000;
    const chunks = Object.keys(stat.compilation.namedChunks).join(' ');
    log(`Webpack built: [${timeCost.toFixed(3)}s] ${chunks}`);
  });
}

function clean() {
  return del(DIST);
}

function watch() {
  gulp.watch(paths.def, manifest);
  gulp.watch(paths.copy, copyFiles);
  gulp.watch(paths.locales.concat(paths.templates), copyI18n);
}

function jsDev(done) {
  let firstRun = true;
  webpack(webpackConfig).watch({}, (...args) => {
    webpackCallback(...args);
    if (firstRun) {
      firstRun = false;
      done();
    }
  });
}

function jsProd(done) {
  webpack(webpackConfig, (...args) => {
    webpackCallback(...args);
    done();
  });
}

function manifest() {
  return gulp.src(paths.def)
  .pipe(bom.strip())
  .pipe(string((input, file) => {
    const data = yaml.safeLoad(input);
    data[0].version = pkg.version;
    data[0].service.debug = IS_DEV;
    definitions['process.env'].manifest = JSON.stringify(data[0]);
    file.path = file.path.replace(/\.yml$/, '.json');
    return JSON.stringify(data);
  }))
  .pipe(bom.add())
  .pipe(gulp.dest(DIST));
}

function copyFiles() {
  const jsFilter = gulpFilter(['**/*.js'], { restore: true });
  let stream = gulp.src(paths.copy, { base: 'src' });
  if (!IS_DEV) stream = stream
  .pipe(jsFilter)
  .pipe(uglify())
  .pipe(jsFilter.restore);
  return stream
  .pipe(gulp.dest(DIST));
}

function copyI18n() {
  return gulp.src(paths.templates)
  .pipe(bom.strip())
  .pipe(plumber(logError))
  .pipe(i18n.extract({
    base: 'src/_locales',
    touchedOnly: true,
    useDefaultLang: true,
    markUntouched: false,
    extension: '.ini',
  }))
  .pipe(bom.add())
  .pipe(gulp.dest(`${DIST}/locale`));
}

function updateI18n() {
  return gulp.src(paths.templates)
  .pipe(bom.strip())
  .pipe(plumber(logError))
  .pipe(i18n.extract({
    base: 'src/_locales',
    touchedOnly: false,
    useDefaultLang: false,
    markUntouched: true,
    extension: '.yml',
  }))
  .pipe(bom.add())
  .pipe(gulp.dest('src/_locales'));
}

function logError(err) {
  log(err.toString());
  return this.emit('end');
}

const pack = gulp.parallel(manifest, copyFiles, copyI18n);

exports.clean = clean;
exports.dev = gulp.series(gulp.parallel(pack, jsDev), watch);
exports.build = gulp.parallel(pack, jsProd);
exports.i18n = updateI18n;
