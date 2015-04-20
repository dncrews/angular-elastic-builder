/**
 * angular-elastic-builder
 *
 * /src/directives/RuleTypes.js
 *
 * Determines which Rule type should be displayed
 */

(function(angular) {
  'use strict';

  var app = angular.module('angular-elastic-builder');

  app.directive('elasticType', [

    function() {
      return {
        scope: {
          type: '=elasticType',
          rule: '=',
          guide: '=',
        },

        template: '<ng-include src="getTemplateUrl()" />',

        link: function(scope) {
          scope.getTemplateUrl = function() {
            var type = scope.type;
            if (! type) return;

            type = type.charAt(0).toUpperCase() + type.slice(1);

            return 'angular-elastic-builder/types/' + type + '.html';
          };

          // This is a weird hack to make sure these are numbers
          scope.booleans = [ 'False', 'True' ];
          scope.booleansOrder = [ 'True', 'False' ];

          scope.inputNeeded = function() {
            var needs = [
              'equals',
              'notEquals',

              'gt',
              'gte',
              'lt',
              'lte',
            ];

            return ~needs.indexOf(scope.rule.subType);
          };
        },
      };
    }

  ]);

})(window.angular);
