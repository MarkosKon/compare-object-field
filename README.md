# Compare object field to value

> A tiny function that compares an object's field with a value (or just checks the field) by using [currying](https://hackernoon.com/currying-in-js-d9ddc64f162e) and [closures]().

## Installation

`npm i compare-object-field` or just copy the `src/index.js` to your project.

## Example usage

### 1. Generic form

```
import compareFieldToValue, { equals } from 'compare-object-field';

const person = { name: 'John' };
compareFieldToValue(equals)('name')('John')(person); // true
```

### 2. Creating new functions

```
import compareFieldToValue, { lessThan } from 'compare-object-field';

const products = [
  {
    name: 'Xiaomi Redmi Note 5',
    brand: 'Xiaomi',
    cost: 180,
    year: 2018,
  },
  {
    name: 'Samsung Galaxy S8',
    brand: 'Samsung',
    cost: 450,
    year: 2017,
  },
  {
    name: 'Apple iPhone 7',
    brand: 'Apple',
    cost: 513,
    year: 2016,
  },
];
const fieldLessThan = compareFieldToValue(lessThan); // We can use it later on other objects or different fields.
const costLessThan200 = fieldLessThan('cost')(200);

const productsUnder200 = products.filter(costLessThan200); // results to: [{name: 'Xiaomi Redmi Note 5', brand: 'Xiaomi', cost: 180}]
```

## The actual function:

`const compareObjectFieldToValue = operation => field => value => object => operation(object[field], value)`

It compares an object's field to a value and returns true or false. It's a curried function that takes 4 arguments.

- The **operation** which is a **function** that you can import (import { operationName } from "compare-object-field"), or create your own. It basically compares two things and returns true or false. The available operations are:

```
    * equals = (a, b) => a === b
    * notEquals = (a, b) => a !== b
    * greaterThan = (a, b) => a > b
    * lessThan = (a, b) => a < b
    * includes = (a, b) => a.includes(b)
    * notIncludes = (a, b) => !a.includes(b)
    * isIncludedIn = (a, b) => b.includes(a)
    * notIncludedIn = (a, b) => !b.includes(a)
    * match = (a, b) => (a.match(new RegExp(b, 'gi')) ? true : false)
    * notMatch = (a, b) => (a.match(new RegExp(b, 'gi')) ? false : true)
    * matchCaseSensitive = (a, b) => a.match(new RegExp(b, 'g')) ? true : false
    * isEven = a => a % 2 === 0
    * isOdd = a => a % 2 !== 0
```

- The object's **field name** which is a **string**. For example 'cost' for product.cost.
- The **value** you want to compare to, which can be **anything**.
- And the actual **object**.

## A use case for the generic form

> Let me know if there is a better solution to this problem (maybe a design pattern?).

Say we have the previous array of products and we want to filter them based on some filters. Those filters can be as **many** as the different field values of the products. They could be **stored** in a database or **dynamically generated**. So for example we may end up with the following filters:

```
const currentFilters = [
  { field: 'year', operation: 'EQUALS', value: 2016 },
  { field: 'cost', operation: 'GREATER_THAN', value: 500 },
];
```

We start by importing the required functions:

```
import compareFieldToValue, { greaterThan, equals } from 'compare-object-field'
```

Then we change the names of the operations we imported to the names of the operations from the data and keep them as a global variable.

```
const operations = {
    EQUALS: equals,
    GREATER_THAN: greaterThan,
};
```

Then we assume that all the filters must be true (AND logical operator). So we create a method that will compare a filter array against a product.

```
const satisfiesAllFilters = (product, filters) => filters.reduce(
  (result, filter) => (result
    ? compareFieldToValue(operations[filter.operation])(filter.field)(filter.value)(product)
    : false),
  true,
);

```
And finally to get our result:

```
const badPurchase = products.filter(product => satisfiesAllFilters(product, currentFilters));
```

or you can use the already **implemented method**: 
```
import { initializeOperations } from "compare-object-field"

const addFilters = initializeOperations(operations); // this can be saved for later, it's an initialization.

const allFiltersTrue = true;
const satisfiesFilters = addFilters(currentFilters, allFiltersTrue);
const badPurchase = products.filter(satisfiesFilters);
```

which results to:
```
[
  {
    name: 'Apple iPhone 7',
    brand: 'Apple',
    cost: 513,
    year: 2016,
  },
]
```

## Benefits

- Code reusability
- More expressive and easier to read code
- Easier to test
