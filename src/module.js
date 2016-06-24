/**
 * angular-elastic-builder
 *
 * /src/module.js
 *
 * Angular Module for building an Elasticsearch query
 */

(function(angular) {
  'use strict';

  angular.module('angular-elastic-builder', [
    'RecursionHelper',
    'ui.bootstrap',
    'angularMoment'
  ]);
  //angular.module('angular-elastic-builder').constant('moment', require('moment-timezone'));

})(window.angular);
