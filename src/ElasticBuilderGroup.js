/**
 * angular-elastic-builder
 *
 * /src/ElasticBuilderGroup.js
 */

(function(angular) {
  'use strict';

  var app = angular.module('angular-elastic-builder');

  app.directive('elasticBuilderGroup', [
    '$templateCache',
    'RecursionHelper',

    function elasticBuilderGroup($templateCache, RH) {

      return {
        scope: {
          elasticFields: '=',
          group: '=elasticBuilderGroup',
          onRemove: '&',
        },

        template: $templateCache.get('angular-elastic-builder/GroupDirective.html'),

        compile: function(element) {
          return RH.compile(element, function(scope, el, attrs) {
            scope.depth = (+ attrs.depth);
            var group = scope.group;

            scope.addRule = function() {
              group.rules.push({});
            };
            scope.addGroup = function() {
              group.rules.push({
                type: 'group',
                subType: 'and',
                rules: [],
              });
            };

            scope.removeChild = function(idx) {
              group.rules.splice(idx, 1);
            };
          });
        }
      };
    }

  ]);

})(window.angular);
