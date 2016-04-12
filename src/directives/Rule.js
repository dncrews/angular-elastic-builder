/**
 * angular-elastic-builder
 *
 * /src/directives/Rule.js
 */

(function(angular) {
  'use strict';

  var app = angular.module('angular-elastic-builder');

  app.directive('elasticBuilderRule', [

    function elasticBuilderRule() {
      return {
        scope: {
          elasticFields: '=',
          rule: '=elasticBuilderRule',
          onRemove: '&',
        },

        templateUrl: 'angular-elastic-builder/RuleDirective.html',

        link: function(scope) {
          scope.getType = function() {
            var fields = scope.elasticFields
              , field = scope.rule.field;

            if (!fields || !field) return;

            if (fields[field].subType === 'boolean') return 'boolean';

            return fields[field].type;
          };
        },
      };
    },

  ]);

})(window.angular);
