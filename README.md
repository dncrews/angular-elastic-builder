# Angular Elasticsearch Query Builder

[![NPM version][npm-image]][npm-url]
![Bower version][bower-image]
[![Downloads][downloads-image]][downloads-url]
[![Tips][gratipay-image]][gratipay-url]

This is an Angular.js directive for building an [Elasticsearch](https://www.elastic.co/) query.
You just give it the fields and can generate a query for it. Its layout is defined using [Bootstrap](http://getbootstrap.com/) classes, but you may also choose to just style it yourself.

It's still pretty early on, as it doesn't support a whole lot of use-cases, but we need to make it awesome. Contributions accepted.

## Try it Out
[View an example here](http://dncrews.com/angular-elastic-builder/examples/)

## Usage

### Dependency
Notice: this plugin requires:
  - the [Angular Recursion](https://github.com/marklagendijk/angular-recursion) module.
  - the [Angular directives for Bootstrap](https://github.com/angular-ui/bootstrap) module to display the Calendar (ui.bootstrap.datepicker)

### Installation
First you'll need to download the [dist](https://github.com/dncrews/angular-elastic-builder/tree/master/dist) files and include this JS file to your app (don't forget to substitute `x.x.x` with the current version number), along with the RecursionHelper, if you're not already using it.
```html
<script type="text/javascript" src="angular-ui-bootstrap/ui-bootstrap-tpls.js"></script>
<script type="text/javascript" src="angular-recursion/angular-recursion.min.js"></script>
<script type="text/javascript" src="angular-elastic-builder/angular-elastic-builder.min.js"></script>
```

Then make sure that it's included in your app's dependencies during module creation.

```js
angularmodule('appName', [ 'angular-elastic-builder' ]);
```

Then you can use it in your app
```js
/* Controller code */

/**
 * The elasticBuilderData object will be modified in place so that you can use
 * your own $watch, and/or your own saving mechanism
 */
$scope.elasticBuilderData = {};
$scope.elasticBuilderData.query = [];

/**
 * This object is the lookup for what fields
 * are available in your database, as well as definitions of what kind
 * of data they are
 */
$scope.elasticBuilderData.fields = {
 'test.number': { type: 'number', minimum: 650 },
 'test.term': { type: 'term' },
 'test.boolean': { type: 'term', subType: 'boolean' },
 'test.state.multi': { type: 'multi', choices: [ 'AZ', 'CA', 'CT' ]},
 'test.date': { type: 'date' },
 'test.otherdate': { type: 'date' }
};
```

```html
<div data-elastic-builder="elasticBuilderData"></div>
```

The above elasticFields would allow you create the following form:
![Screenshot][screenshot-image]

Which represents the following Elasticsearch Query:
```json
[
  {
    "and": [
      {
        "term": {
          "test.date": "2016-04-08T10:44:06"
        }
      },
      {
        "range": {
          "test.number": {
            "gte": 650
          }
        }
      },
      {
        "range": {
          "test.number": {
            "lt": 850
          }
        }
      }
    ]
  },
  {
    "term": {
      "test.boolean": 0
    }
  },
  {
    "terms": {
      "test.state.multi": [ "AZ", "CT" ]
    }
  },
  {
    "not": {
      "filter": {
        "term": {
          "test.term": "asdfasdf"
        }
      }
    }
  },
  {
    "exists": {
      "field": "test.term"
    }
  },
  {
    "range": {
      "test.otherdate": {
        "gte": "now",
        "lte": "now+7d"
      }
    }
  }
]
```


### Field Options
  - `type`: This determines how the fields are displayed in the form.
    - Currently supported:
      - `'number'`: in addition to Generic Options, gets "&gt;", "&ge;", "&lt;", "&le;", "="
      - `'term'`: in addition to Generic Options, gets "Equals" and "! Equals"
      - `'boolean'`: Does not get Generic Options. Gets `true` and `false`
        - These are actually "equals 0" and "equals 1" for the database query
      - `'date'`: in addition to Generic Options, gets "&gt;", "&ge;", "&lt;", "&le;", "="

Generic Options
  - In addition to any specific options for fields, all fields also get a "Exists" and "! Exists" option


## External Changes && Initial State
If you want to pass in an initial state (or if you make changes to the query externally), you'll need to
set the configuration flag `needsUpdate` to `true`. Any time this flag changes to `true`, this directive
will overwrite the current state and data with whatever is now defined in your configuration object.


## Local Development
To work on this module locally, you will need to clone it and run `gulp watch`. This will ensure that your changes get compiled properly. You will also need to make sure you run `gulp` to build the "dist" files before commit.


[npm-image]: https://img.shields.io/npm/v/angular-elastic-builder.svg
[npm-url]: https://www.npmjs.org/package/angular-elastic-builder
[bower-image]: https://img.shields.io/bower/v/angular-elastic-builder.svg
[downloads-image]: https://img.shields.io/npm/dm/angular-elastic-builder.svg
[downloads-url]: https://www.npmjs.org/package/angular-elastic-builder
[gratipay-image]: https://img.shields.io/gratipay/dncrews.svg
[gratipay-url]: https://www.gratipay.com/dncrews/
[screenshot-image]: ./screenshot.png

