/**
 * angular-elastic-builder
 *
 * /src/services/QueryService.js
 *
 * This file is used to convert filters into queries, and vice versa
 */

(function(angular) {
  'use strict';

  angular.module('angular-elastic-builder')
    .factory('elasticQueryService', [
      '$filter',

      function($filter) {

        return {
          toFilters: toFilters,
          toQuery: function(filters, fieldMap) {
            return toQuery(filters, fieldMap, $filter);
          },
        };
      },
    ]);

  function toFilters(query, fieldMap){
    var filters = query.map(parseQueryGroup.bind(query, fieldMap));
    return filters;
  }

  function toQuery(filters, fieldMap, $filter){
    var query = filters.map(parseFilterGroup.bind(filters, fieldMap, $filter)).filter(function(item) {
      return !!item;
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
        obj.field = Object.keys(group[key])[0];
        obj.value = group[key][obj.field];
        var fieldData = fieldMap[Object.keys(group[key])[0]];

        if (fieldData.type === 'date') {
            obj.subType = 'equals';
            obj.format = group.term.format;
        } else {
          obj.subType = truthy ? 'equals' : 'notEquals';
          obj.value = group[key][obj.field];

          if (typeof obj.value === 'number') {
            obj.subType = 'boolean';
          }
        }
        break;

      case 'terms':
        obj.field = Object.keys(group[key])[0];
        var fieldData = fieldMap[Object.keys(group[key])[0]];

        if (fieldData.type === 'multi') {
          var vals = group[key][obj.field];
          if (typeof vals === 'string') vals = [ vals ];
          obj.values = fieldData.choices.reduce(function(prev, choice) {
            prev[choice] = (group[key][obj.field].indexOf(choice) != -1);
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
        var date, parts;
        obj.field = Object.keys(group[key])[0];
        obj.subType = Object.keys(group[key][obj.field])[0];
        var fieldData = fieldMap[Object.keys(group[key])[0]];

        if (fieldData.type === 'date') {

          if (group[key][obj.field].format) {
            for (var subType in group[key][obj.field]) {
              if (subType != "format") {
                date = group[key][obj.field][subType];
                obj.value = date;
              } else {
                obj.format = group[key][obj.field].format;
              }
            }
            break;

          } else {

            if (angular.isDefined(Object.keys(group[key][obj.field])[1])) {
              date = group[key][obj.field].gte;

              if (~date.indexOf('now-')) {
                obj.subType = 'last';
                obj.value = parseInt(date.split('now-')[1].split('d')[0]);
                break;
              }

              if (~date.indexOf('now')) {
                obj.subType = 'next';
                date = group[key][obj.field].lte;
                obj.value = parseInt(date.split('now+')[1].split('d')[0]);
                break;
              }
            }
          }
        }

        if (fieldData.type === 'number') {
          if (angular.isNumber(group[key][obj.field][obj.subType])) {
            obj.value = group[key][obj.field][obj.subType];
            break;
          }
        }

      case 'not':
        obj = parseQueryGroup(fieldMap, group[key].filter, false);
        break;
      default:
        obj.field = Object.keys(group[key])[0];
        break;
    }

    return obj;
  }

  function parseFilterGroup(fieldMap, $filter, group) {
    var obj = {};
    if (group.type === 'group') {
      obj[group.subType] = group.rules.map(parseFilterGroup.bind(group, fieldMap, $filter)).filter(function(item) {
        return !!item;
      });
      return obj;
    }

    var fieldName = group.field;
    var fieldData = fieldMap[fieldName];


    if (!fieldName) return;

    switch (fieldData.type) {
      case 'term':
        if (fieldData.subType === 'boolean') group.subType = 'boolean';

        if (!group.subType) return;
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
        if (!group.subType) return;

        switch (group.subType) {
          case 'equals':
            if (!angular.isDate(group.date)) return;
            obj.term = {};
            obj.term[fieldName] = formatDate($filter, group.date, group.format);
            obj.term.format = group.format;
            break;
          case 'lt':
          case 'lte':
            if (!angular.isDate(group.date)) return;
            obj.range = {};
            obj.range[fieldName] = {};
            obj.range[fieldName][group.subType] = formatDate($filter, group.date, group.format);
            obj.range[fieldName]["format"] = group.format;
            break;
          case 'gt':
          case 'gte':
            if (!angular.isDate(group.date)) return;
            obj.range = {};
            obj.range[fieldName] = {};
            obj.range[fieldName][group.subType] = formatDate($filter, group.date, group.format);
            obj.range[fieldName]["format"] = group.format;
            break;
          case 'last':
            if (!angular.isNumber(group.value)) return;
            obj.range = {};
            obj.range[fieldName] = {};
            obj.range[fieldName].gte = 'now-' + group.value + 'd';
            obj.range[fieldName].lte = 'now';
            break;
          case 'next':
            if (!angular.isNumber(group.value)) return;
            obj.range = {};
            obj.range[fieldName] = {};
            obj.range[fieldName].gte = 'now';
            obj.range[fieldName].lte = 'now+' + group.value + 'd';
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
        format: '',
      },
      number: {
        field: '',
        subType: '',
        value: null,
      },
    };

    return angular.copy(templates[type]);
  }

  function formatDate($filter, date, format) {
    if (!angular.isDate(date)) return false;
    var fDate = $filter('date')(date, format);
    return fDate;
  }

})(window.angular);
