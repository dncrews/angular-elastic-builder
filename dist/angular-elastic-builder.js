/**
 * # angular-elastic-builder
 * ## Angular Module for building an Elasticsearch Query
 *
 * @version v1.1.0
 * @link https://github.com/dncrews/angular-elastic-builder.git
 * @license MIT
 * @author Dan Crews <crewsd@gmail.com>
 */

/**
 * angular-elastic-builder
 *
 * /src/module.js
 *
 * Angular Module for building an Elasticsearch query
 */

(function(angular) {
  'use strict';

  angular.module('angular-elastic-builder', [
    'RecursionHelper',
  ]);

})(window.angular);

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

/**
 * angular-elastic-builder
 *
 * /src/ElasticBuilderDirective.js
 *
 * Angular Directive for injecting a query builder form.
 */

 (function(angular) {
   'use strict';

   angular.module('angular-elastic-builder')
    .directive('elasticBuilder', [
      '$templateCache',
      'elasticBuilderService',

      function EB($templateCache, elasticBuilderService) {

        return {
          scope: {
            data: '=elasticBuilder',
          },

          template: $templateCache.get('angular-elastic-builder/BuilderDirective.html'),

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

              scope.filters = elasticBuilderService.toFilters(data.query, scope.data.fields);

              /* Stop Watching */
              unwatcher();
            }, true);

            /**
             * Changes on the page update the Query
             */
            scope.$watch('filters', function(curr) {
              if (! curr) return;

              data.query = elasticBuilderService.toQuery(scope.filters, scope.data.fields);
            }, true);
          }
        };
      }

    ]);

 })(window.angular);

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

/**
 * angular-elastic-builder
 *
 * /src/ElasticBuilderPath.js
 *
 * This file is used to generate the path to the template files
 */

(function(angular) {
  'use strict';

  angular.module('angular-elastic-builder')
    .factory('elasticBuilderPath', function elasticBuilderPath() {

      var filename = angular.element('script[src*=angular-elastic-builder').eq(0).attr('src');

      var parts = filename.split('/');
      parts.pop();
      var path = parts.join('/');

      return path;
    });

})(window.angular);

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

/**
 * angular-elastic-builder
 *
 * /src/ElasticBuilderService.js
 *
 * This file is used to convert filters into queries, and vice versa
 */

(function(angular) {
  'use strict';

  angular.module('angular-elastic-builder')
    .factory('elasticBuilderService', function elasticBuilderService() {

      return {
        toFilters: toFilters,
        toQuery: toQuery,
      };

      function toFilters(query, fieldMap){
        var filters = query.map(parseQueryGroup.bind(query, fieldMap));
        return filters;
      }

      function toQuery(filters, fieldMap){
        var query = filters.map(parseFilterGroup.bind(filters, fieldMap)).filter(function(item) {
          return !! item;
        });
        return query;
      }

      function parseQueryGroup(fieldMap, group, truthy) {
        if (truthy !== false) truthy = true;

        var key = Object.keys(group)[0]
          , typeMap = {
            or: 'group',
            and: 'group',
            range: 'number',
          }
          , type = typeMap[key] || 'item'
          , obj = getFilterTemplate(type);

        switch (key) {
          case 'or':
          case 'and':
            obj.rules = group[key].map(parseQueryGroup.bind(group, fieldMap));
            obj.subType = key;
            break;
          case 'missing':
          case 'exists':
            obj.field = group[key].field;
            obj.subType = {
              exists: 'exists',
              missing: 'notExists',
            }[key];
            delete obj.value;
            break;
          case 'term':
          case 'terms':
            obj.field = Object.keys(group[key])[0];
            var fieldData = fieldMap[Object.keys(group[key])[0]];

            if (fieldData.type === 'multi') {
              var vals = group[key][obj.field];
              if (typeof vals === 'string') vals = [ vals ];
              obj.values = fieldData.choices.reduce(function(prev, choice) {
                prev[choice] = truthy === (group[key][obj.field].indexOf(choice) > -1);
                return prev;
              }, {});
            } else {
              obj.subType = truthy ? 'equals' : 'notEquals';
              obj.value = group[key][obj.field];

              if (typeof obj.value === 'number') {
                obj.subType = 'boolean';
              }
            }
            break;
          case 'range':
            obj.field = Object.keys(group[key])[0];
            obj.subType = Object.keys(group[key][obj.field])[0];
            obj.value = group[key][obj.field][obj.subType];
            break;
          case 'not':
            obj = parseQueryGroup(fieldMap, group[key].filter, false);
            break;
          default:
            obj.field = Object.keys(group[key])[0];
            break;
        }

        return obj;
      }

      function parseFilterGroup(fieldMap, group) {
        var obj = {};
        if (group.type === 'group') {
          obj[group.subType] = group.rules.map(parseFilterGroup.bind(group, fieldMap)).filter(function(item) {
            return !! item;
          });
          return obj;
        }

        var fieldName = group.field;
        var fieldData = fieldMap[fieldName];


        if (! fieldName) return;

        switch (fieldData.type) {
          case 'term':
            if (fieldData.subType === 'boolean') group.subType = 'boolean';

            if (! group.subType) return;
            switch (group.subType) {
              case 'equals':
              case 'boolean':
                if (group.value === undefined) return;
                obj.term = {};
                obj.term[fieldName] = group.value;
                break;
              case 'notEquals':
                if (group.value === undefined) return;
                obj.not = { filter: { term: {}}};
                obj.not.filter.term[fieldName] = group.value;
                break;
              case 'exists':
                obj.exists = { field: fieldName };
                break;
              case 'notExists':
                obj.missing = { field: fieldName };
                break;
              default:
                throw new Error('unexpected subtype ' + group.subType);
            }
            break;

          case 'number':
            obj.range = {};
            obj.range[fieldName] = {};
            obj.range[fieldName][group.subType] = group.value;
            break;

          case 'date':
            if (group.subType === 'exists') {
              obj.exists = { field: fieldName };
            } else if (group.subType === 'notExists') {
              obj.missing = { field: fieldName };
            } else {
              throw new Error('unexpected subtype');
            }

            break;

          case 'multi':
            obj.terms = {};
            obj.terms[fieldName] = Object.keys(group.values || {}).reduce(function(prev, key) {
              if (group.values[key]) prev.push(key);

              return prev;
            }, []);
            break;

          default:
            throw new Error('unexpected type');
        }

        return obj;
      }

      function getFilterTemplate(type) {
        var templates = {
          group: {
            type: 'group',
            subType: '',
            rules: [],
          },
          item: {
            field: '',
            subType: '',
            value: '',
          },
          number: {
            field: '',
            subType: '',
            value: null,
          }
        };

        return angular.copy(templates[type]);
      }

    });

})(window.angular);

(function(angular) {"use strict"; angular.module("angular-elastic-builder").run(["$templateCache", function($templateCache) {$templateCache.put("angular-elastic-builder/BuilderDirective.html","<div class=\"elastic-builder\">\n  <div class=\"filter-panels\">\n    <div class=\"list-group form-inline\">\n      <div\n        data-ng-repeat=\"filter in filters\"\n        data-elastic-builder-chooser=\"filter\"\n        data-elastic-fields=\"data.fields\"\n        data-on-remove=\"removeChild($index)\"\n        data-depth=\"0\"></div>\n      <div class=\"list-group-item actions\">\n        <button class=\"btn btn-xs btn-primary\" title=\"Add Rule\" data-ng-click=\"addRule()\">\n          <i class=\"fa fa-plus\"></i>\n        </button>\n        <button class=\"btn btn-xs btn-primary\" title=\"Add Group\" data-ng-click=\"addGroup()\">\n          <i class=\"fa fa-list\"></i>\n        </button>\n      </div>\n    </div>\n  </div>\n</div>\n");
$templateCache.put("angular-elastic-builder/ChooserDirective.html","<div\n  class=\"list-group-item elastic-builder-chooser\"\n  data-ng-class=\"getGroupClassName()\">\n\n  <div data-ng-if=\"item.type === \'group\'\"\n    data-elastic-builder-group=\"item\"\n    data-depth=\"{{ depth }}\"\n    data-elastic-fields=\"elasticFields\"\n    data-on-remove=\"onRemove()\"></div>\n\n  <div data-ng-if=\"item.type !== \'group\'\"\n    data-elastic-builder-rule=\"item\"\n    data-elastic-fields=\"elasticFields\"\n    data-on-remove=\"onRemove()\"></div>\n\n</div>\n");
$templateCache.put("angular-elastic-builder/GroupDirective.html","<div class=\"elastic-builder-group\">\n  <h5>If\n    <select data-ng-model=\"group.subType\" class=\"form-control\">\n      <option value=\"and\">all</option>\n      <option value=\"or\">any</option>\n    </select>\n    of these conditions are met\n  </h5>\n  <div\n    data-ng-repeat=\"rule in group.rules\"\n    data-elastic-builder-chooser=\"rule\"\n    data-elastic-fields=\"elasticFields\"\n    data-depth=\"{{ +depth + 1 }}\"\n    data-on-remove=\"removeChild($index)\"></div>\n\n  <div class=\"list-group-item actions\">\n    <button class=\"btn btn-xs btn-primary\" title=\"Add Sub-Rule\" data-ng-click=\"addRule()\">\n      <i class=\"fa fa-plus\"></i>\n    </button>\n    <button class=\"btn btn-xs btn-primary\" title=\"Add Sub-Group\" data-ng-click=\"addGroup()\">\n      <i class=\"fa fa-list\"></i>\n    </button>\n  </div>\n\n  <button class=\"btn btn-xs btn-danger remover\" data-ng-click=\"onRemove()\">\n    <i class=\"fa fa-minus\"></i>\n  </button>\n</div>\n");
$templateCache.put("angular-elastic-builder/RuleDirective.html","<div class=\"elastic-builder-rule\">\n  <select class=\"form-control\" data-ng-model=\"rule.field\" data-ng-options=\"key as key for (key, value) in elasticFields\"></select>\n\n  <span data-ng-if=\"elasticFields[rule.field].subType === \'boolean\'\">\n    Equals\n    <select data-ng-model=\"rule.value\" class=\"form-control\">\n      <option value=\"0\">False</option>\n      <option value=\"1\">True</option>\n    </select>\n  </span>\n  <span data-ng-if=\"elasticFields[rule.field].type === \'multi\'\">\n    <span data-ng-repeat=\"choice in elasticFields[rule.field].choices\">\n      <label class=\"checkbox state\">\n        <input type=\"checkbox\" data-ng-model=\"rule.values[choice]\">\n        {{ choice }}\n      </label>\n    </span>\n  </span>\n  <span data-ng-if=\"(elasticFields[rule.field].subType !== \'boolean\' && elasticFields[rule.field].type !== \'multi\')\">\n    <select data-ng-model=\"rule.subType\" class=\"form-control\">\n      <!-- Range Options -->\n      <optgroup label=\"Numeral\" data-ng-if=\"elasticFields[rule.field].type === \'number\'\">\n        <option value=\"equals\">=</option>\n        <option value=\"gt\">&gt;</option>\n        <option value=\"gte\">&ge;</option>\n        <option value=\"lt\">&lt;</option>\n        <option value=\"lte\">&le;</option>\n      </optgroup>\n\n      <!-- Term Options -->\n      <optgroup label=\"Text\" data-ng-if=\"elasticFields[rule.field].type === \'term\'\">\n        <option value=\"equals\">Equals</option>\n        <option value=\"notEquals\">! Equals</option>\n      </optgroup>\n\n      <!-- Generic Options -->\n      <optgroup label=\"Generic\">\n        <option value=\"exists\">Exists</option>\n        <option value=\"notExists\">! Exists</option>\n      </optgroup>\n\n    </select>\n\n\n    <!-- Range Fields -->\n    <input class=\"form-control\" data-ng-model=\"rule.value\" type=\"number\" data-ng-if=\"elasticFields[rule.field].type === \'number\'\">\n\n    <!-- Term Fields -->\n    <input class=\"form-control\" data-ng-model=\"rule.value\" type=\"text\" data-ng-if=\"([\'equals\',\'notEquals\'].indexOf(rule.subType) > -1) && (elasticFields[rule.field].type === \'term\')\">\n  </span>\n\n\n  <button class=\"btn btn-xs btn-danger remover\" data-ng-click=\"onRemove()\">\n    <i class=\"fa fa-minus\"></i>\n  </button>\n\n</div>\n");}]);})(window.angular);