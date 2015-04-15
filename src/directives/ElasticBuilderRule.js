/**
 * angular-elastic-builder
 *
 * /src/ElasticBuilderRule.js
 */

(function(angular) {
  'use strict';

  var app = angular.module('angular-elastic-builder');

  app.directive('elasticBuilderRule', [
    '$templateCache',

    function elasticBuilderRule($templateCache) {
      return {
        scope: {
          elasticFields: '=',
          rule: '=elasticBuilderRule',
          onRemove: '&',
        },

        template: $templateCache.get('angular-elastic-builder/RuleDirective.html'),
      };
    }

  ]);

})(window.angular);
