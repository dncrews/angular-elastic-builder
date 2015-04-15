/**
 * angular-elastic-builder
 *
 * /src/ElasticBuilderChooser.js
 *
 * This file is to help recursively, to decide whether to show a group or rule
 */

(function(angular) {
  'use strict';

  var app = angular.module('angular-elastic-builder');

  app.directive('elasticBuilderChooser', [
    '$templateCache',
    'RecursionHelper',

    function elasticBuilderChooser($templateCache, RH) {

      return {
        scope: {
          elasticFields: '=',
          item: '=elasticBuilderChooser',
          onRemove: '&',
        },

        template: $templateCache.get('angular-elastic-builder/ChooserDirective.html'),

        compile: function (element) {
          return RH.compile(element, function(scope, el, attrs) {
            var depth = scope.depth = (+ attrs.depth)
              , item = scope.item;

            scope.getGroupClassName = function() {
              var levels = [
                '',
                'list-group-item-info',
                'list-group-item-success',
                'list-group-item-warning',
                'list-group-item-danger',
              ];

              var level = depth;
              if (item.type === 'group') level++;

              level = level % levels.length;

              return levels[level];
            };
          });
        }
      };
    }

  ]);

})(window.angular);
