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
Notice: this plugin requires the [Angular Recursion](https://github.com/marklagendijk/angular-recursion) module.

### Installation
First you'll need to download the [dist](https://github.com/dncrews/angular-elastic-builder/tree/master/dist) files and include this JS file to your app (don't forget to substitute `x.x.x` with the current version number), along with the RecursionHelper, if you're not already using it.
```html
<script type="text/javascript" src="/angular-recursion.min.js"></script>
<script type="text/javascript" src="/angular-elastic-builder.min.js"></script>
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
  'some.number.field': { type: 'number' },
  'some.term.field': { type: 'term' },
  'some.boolean.field': { type: 'term', subType: 'boolean' },
  'multi.selector': { type: 'multi', choices: [ 'AZ', 'CA', 'CT' ]}
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
    "terms": {
      "multi.selector": [
        "AZ",
        "CT"
      ]
    }
  },
  {
    "term": {
      "some.boolean.field": "0"
    }
  },
  {
    "not": {
      "filter": {
        "term": {
          "some.term.field": "Hello World"
        }
      }
    }
  },
  {
    "and": [
      {
        "range": {
          "some.number.field": {
            "gte": 0
          }
        }
      },
      {
        "range": {
          "some.number.field": {
            "lt": 100
          }
        }
      }
    ]
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
[screenshot-image]: https://raw.githubusercontent.com/dncrews/angular-elastic-builder/master/screenshot.png
