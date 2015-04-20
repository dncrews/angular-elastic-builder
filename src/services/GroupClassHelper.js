/**
 * angular-elastic-builder
 *
 * /src/services/GroupClassHelper.js
 *
 * This keeps all of the groups colored correctly
 */

(function(angular) {
  'use strict';

  angular.module('angular-elastic-builder')
    .factory('groupClassHelper', function groupClassHelper() {

      return function(level) {
        var levels = [
          '',
          'list-group-item-info',
          'list-group-item-success',
          'list-group-item-warning',
          'list-group-item-danger',
        ];

        return levels[level % levels.length];
      };
    });

})(window.angular);
