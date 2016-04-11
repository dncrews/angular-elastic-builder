(function(angular) {

  var app = angular.module('exampleApp', [
    'angular-elastic-builder',
  ]);

  app.controller('BasicController', function() {

    var data = this.data = {};

    data.query = [
      {
        'and': [
          {
            'term': {
              'test.date': '2016-04-08T09:16:48'
            }
          },
          {
            'range': {
              'test.number': {
                'gte': 650
              }
            }
          },
          {
            'range': {
              'test.number': {
                'lt': 850
              }
            }
          }
        ]
      },
      {
        'term': {
          'test.boolean': 0
        }
      },
      {
        'terms': {
          'test.state.multi': [ 'AZ', 'CT' ]
        }
      },
      {
        'not': {
          'filter': {
            'term': {
              'test.term': 'asdfasdf'
            }
          }
        }
      },
      {
        'exists': {
          'field': 'test.term'
        }
      },
      {
        'range': {
          'test.otherdate': {
            'gte': 'now',
            'lte': 'now+7d'
          }
        }
      }
    ];

    data.fields = {
      'test.number': { type: 'number', minimum: 650 },
      'test.term': { type: 'term' },
      'test.boolean': { type: 'term', subType: 'boolean' },
      'test.state.multi': { type: 'multi', choices: [ 'AZ', 'CA', 'CT' ]},
      'test.date': { type: 'date' },
      'test.otherdate': { type: 'date' }
    };

    data.needsUpdate = true;

    this.showQuery = function() {
      var queryToShow = {
        size: 0,
        filter: { and : data.query }
      };

      return JSON.stringify(queryToShow, null, 2);
    };

  });

})(window.angular);
