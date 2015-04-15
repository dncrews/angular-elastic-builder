/**
 * Package Dependencies
 */
var concat = require('gulp-concat')
  , del = require('del')
  , gulp = require('gulp')
  , templateCache = require('gulp-angular-templatecache')
  , rename = require('gulp-rename')
  , uglify = require('gulp-uglifyjs')
  , util = require('util');

/**
 * Local Dependencies
 */
var pkg = require('./package.json');

var filename = util.format('%s-%s.js', pkg.name, pkg.version)
  , dest = 'dist/' + filename;

gulp.task('build', ['concat', 'uglify']);
gulp.task('default', ['concat', 'uglify']);


gulp.task('clean', function(done) {
  del('./dist', done);
});

gulp.task('concat', [ 'clean', 'templatecache' ], function() {
  return gulp.src('./src/*.js')
    .pipe(concat(filename))
    .pipe(gulp.dest('./dist'));
});

gulp.task('uglify', [ 'clean', 'concat' ], function() {
  return gulp.src('./dist/*.js')
    .pipe(uglify(dest.replace(/\.js$/, '.min.js')))
    .pipe(gulp.dest('./'));
});

gulp.task('templatecache', function() {
  var TEMPLATE_HEADER = '(function(angular) {"use strict"; angular.module("<%= module %>"<%= standalone %>).run(["$templateCache", function($templateCache) {'
    , TEMPLATE_FOOTER = '}]);})(window.angular);';

  return gulp.src('src/tmpl/*.html')
    .pipe(templateCache({
      root: 'angular-elastic-builder',
      module: 'angular-elastic-builder',
      templateHeader: TEMPLATE_HEADER,
      templateFooter: TEMPLATE_FOOTER,
    }))
    .pipe(rename('ElasticBuilderTemplates.js'))
    .pipe(gulp.dest('src'));
});

gulp.task('watch', function() {
  return gulp.watch('src/tmpl/*.html', [ 'templatecache' ]);
});
