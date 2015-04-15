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
