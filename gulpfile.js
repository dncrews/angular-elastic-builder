/**
 * Package Dependencies
 */
var concat = require('gulp-concat')
  , del = require('del')
  , header = require('gulp-header')
  , gulp = require('gulp')
  , templateCache = require('gulp-angular-templatecache')
  , rename = require('gulp-rename')
  , uglify = require('gulp-uglifyjs')
  , util = require('util');

/**
 * Local Dependencies
 */
var pkg = require('./package.json');
var banner = ['/**'
  , ' * # <%= pkg.name %>'
  , ' * ## <%= pkg.description %>'
  , ' *'
  , ' * @version v<%= pkg.version %>'
  , ' * @link <%= pkg.repository.url %>'
  , ' * @license <%= pkg.license %>'
  , ' * @author <%= pkg.author %>'
  , ' */'
  , ''
  , ''].join('\n');

var filename = util.format('%s.js', pkg.name)
  , dest = 'dist/' + filename;

gulp.task('build', ['uglify']);
gulp.task('default', ['uglify']);


gulp.task('clean', function(done) {
  del('./dist', done);
});

gulp.task('concat', [ 'templatecache' ], function() {
  return gulp.src(['./src/module.js', './src/**/*.js'])
    .pipe(concat(filename))
    .pipe(gulp.dest('./dist'));
});

gulp.task('header', [ 'concat' ], function() {
  return gulp.src('./dist/*.js')
    .pipe(header(banner, { pkg: pkg }))
    .pipe(gulp.dest('./dist'));
});

gulp.task('uglify', [ 'header' ], function() {
  return gulp.src('./dist/*.js')
    .pipe(uglify(dest.replace(/\.js$/, '.min.js')))
    .pipe(gulp.dest('./'));
});

gulp.task('templatecache', [ 'clean' ], function() {
  var TEMPLATE_HEADER = '(function(angular) {"use strict"; angular.module("<%= module %>"<%= standalone %>).run(["$templateCache", function($templateCache) {'
    , TEMPLATE_FOOTER = '}]);})(window.angular);';

  return gulp.src('src/tmpl/**/*.html')
    .pipe(templateCache({
      root: 'angular-elastic-builder',
      module: 'angular-elastic-builder',
      templateHeader: TEMPLATE_HEADER,
      templateFooter: TEMPLATE_FOOTER,
    }))
    .pipe(rename('ElasticBuilderTemplates.js'))
    .pipe(gulp.dest('src/tmpl'));
});

gulp.task('watch', [ 'templatecache', 'build' ], function() {
  gulp.watch('src/tmpl/**/*.html', [ 'templatecache', 'build' ]);
  gulp.watch(['src/**/**.js','!src/tmpl/ElasticBuilderTemplates.js'], [ 'build' ]);
});
