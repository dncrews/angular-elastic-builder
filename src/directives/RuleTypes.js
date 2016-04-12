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
            if (!type) return;

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

          scope.numberNeeded = function() {
            var needs = [
              'last',
              'next',
            ];

            return ~needs.indexOf(scope.rule.subType);
          };

          scope.today = function() {
            scope.rule.date = new Date();
          };
          scope.today();

          scope.clear = function() {
            scope.rule.date = null;
          };

          scope.dateOptions = {
            dateDisabled: disabled,
            formatYear: 'yy',
            maxDate: new Date(2018, 1, 13),
            minDate: new Date(),
            startingDay: 1,
          };

          // Disable weekend selection
          function disabled(data) {
            var date = data.date
              , mode = data.mode;
            return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
          }

          scope.open1 = function() {
            scope.popup1.opened = true;
          };

          scope.setDate = function(year, month, day) {
            scope.rule.date = new Date(year, month - 1, day);
          };

          scope.formats = [
            'yyyy-MM-ddTHH:mm:ss',
            'yyyy-MM-ddTHH:mm:ssZ',
            'yyyy-MM-dd',
            'dd-MMMM-yyyy',
            'yyyy/MM/dd',
            'shortDate',
          ];
          scope.rule.dateFormat = scope.formats[0];
          scope.format = scope.rule.dateFormat;

          scope.altInputFormats = ['M!/d!/yyyy'];

          scope.popup1 = { opened: false };
        },

      };
    },

  ]);

})(window.angular);
