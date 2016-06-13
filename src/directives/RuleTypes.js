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

    '$filter', 'moment', 
    function($filter, moment) {
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

          scope.clear = function() {
            scope.rule.date = null;
          };

          scope.dateOptions = {
            dateDisabled: disabled,
            formatYear: 'yyyy',
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


          scope.formatDate = function (date, format) {
            if (!!scope.rule.format) {
              var inputFormat = scope.rule.format;
              //moment requires yyyy and DD in upper case but ui.datepicker and Elastic require lower case
              var momentFormat = inputFormat.replace(/(yyyy|yy|d|dd|ddd)/g, function(str) {
                  return str.toUpperCase();
              });

              var fDate = moment(date, momentFormat);

              return fDate.toDate(momentFormat);

            }
          }

          scope.formatDate($filter, scope.rule.value, scope.rule.format);

          scope.setDate = function() {
            if (!!scope.rule.format) {
            scope.rule.date = scope.formatDate(scope.rule.value, scope.rule.format);
            scope.date = scope.rule.date;
            }
          };

          scope.setDate();

          scope.formats = [
            'yyyy-MM-ddTHH:mm:ss',
            'yyyy-MM-dd',
            'yyyyMMdd',
            'dd-MMMM-yyyy',
            'yyyy/MM/dd',
            'shortDate',
          ];

          if (scope.rule.hasOwnProperty('format')) {
            scope.format = scope.rule.format;
          }

          scope.altInputFormats = ['M!/d!/yyyy'];

          scope.popup1 = { opened: false };
        },

      };
    },

  ]);

})(window.angular);
