/**
 * angular-elastic-builder
 *
 * /src/ElasticBuilderPath.js
 *
 * This file is used to generate the path to the template files
 */

(function(angular) {
  'use strict';

  angular.module('angular-elastic-builder')
    .factory('elasticBuilderPath', function elasticBuilderPath() {

      var filename = angular.element('script[src*=ngElasticBuilder').eq(0).attr('src');

      var parts = filename.split('/');
      parts.pop();
      var path = parts.join('/');

      return path;
    });

})(window.angular);
