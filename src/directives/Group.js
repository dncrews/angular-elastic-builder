/**
 * angular-elastic-builder
 *
 * /src/directives/Group.js
 */

(function(angular) {
  'use strict';

  var app = angular.module('angular-elastic-builder');

  app.directive('elasticBuilderGroup', [
    'RecursionHelper',
    'groupClassHelper',

    function elasticBuilderGroup(RH, groupClassHelper) {

      return {
        scope: {
          elasticFields: '=',
          group: '=elasticBuilderGroup',
          onRemove: '&',
        },

        templateUrl: 'angular-elastic-builder/GroupDirective.html',

        compile: function(element) {
          return RH.compile(element, function(scope, el, attrs) {
            var depth = scope.depth = (+ attrs.depth);
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

            scope.getGroupClassName = function() {
              return groupClassHelper(depth + 1);
            };
          });
        }
      };
    }

  ]);

})(window.angular);
