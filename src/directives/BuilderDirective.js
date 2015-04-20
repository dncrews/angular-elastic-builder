/**
 * angular-elastic-builder
 *
 * /src/directives/BuilderDirective.js
 *
 * Angular Directive for injecting a query builder form.
 */

 (function(angular) {
   'use strict';

   angular.module('angular-elastic-builder')
    .directive('elasticBuilder', [
      'elasticQueryService',

      function EB(elasticQueryService) {

        return {
          scope: {
            data: '=elasticBuilder',
          },

          templateUrl: 'angular-elastic-builder/BuilderDirective.html',

          link: function(scope) {
            var data = scope.data;

            /**
             * Removes either Group or Rule
             */
            scope.removeChild = function(idx) {
              scope.filters.splice(idx, 1);
            };

            /**
             * Adds a Single Rule
             */
            scope.addRule = function() {
              scope.filters.push({});
            };

            /**
             * Adds a Group of Rules
             */
            scope.addGroup = function() {
              scope.filters.push({
                type: 'group',
                subType: 'and',
                rules: [],
              });
            };

            /**
             * this Watcher gets used only once on initial setting of the query and then not again
             */
            var unwatcher = scope.$watch('data.query', function(curr) {
              if (! curr) return;

              scope.filters = elasticQueryService.toFilters(data.query, scope.data.fields);

              /* Stop Watching */
              unwatcher();
            }, true);

            /**
             * Changes on the page update the Query
             */
            scope.$watch('filters', function(curr) {
              if (! curr) return;

              data.query = elasticQueryService.toQuery(scope.filters, scope.data.fields);
            }, true);
          }
        };
      }

    ]);

 })(window.angular);
