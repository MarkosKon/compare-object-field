# Compare object field to value

> A small library with a function that compares an object's field with a value and two others that use the previous to filter arrays of objects.

## Installation

`npm i compare-object-field`

## Examples

### 1. Generic form

```
import compareFieldToValue, { equals } from 'compare-object-field';

const person = { name: 'John' };
compareFieldToValue(equals)('name')('John')(person); // true
```

### 2. Creating new functions

```
// This is for a more functional style.
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

### 3. Filtering arrays of objects

For more context see "A use case for the generic form" section.

**Problem:** We end up with some **filters** and we want to **apply them** to the products from example 2.

```
const currentFilters = [
  { field: 'year', operation: 'EQUALS', value: 2016 },
  { field: 'cost', operation: 'GREATER_THAN', value: 500 },
];
```

**Solution:** We initialize the operations (by using the implemented method) and then each time we want the resulting products we apply the filters:

```
import { greaterThan, equals, initializeOperations } from "compare-object-field"

// a) We initialize and save for later.
// First we map the operation names.
const operations = {
    EQUALS: equals,
    GREATER_THAN: greaterThan,
};
// Then we initialize the operations.
const addFilters = initializeOperations(operations);

// b) Finally we call the following lines every time we want to search with different filters.
const allFiltersTrue = true;
const satisfiesFilters = addFilters(currentFilters, allFiltersTrue);
const badPurchase = products.filter(satisfiesFilters);
```

### 4. Filtering arrays of objects (another way)

In this example we have a **filter group** which is an object that can have filters or other filter groups as children. The filter group also defines if all it's children must be true or just one (AND, OR).

```
// We want Xiaomi or Samsung phones that cost under 200.
// More specifically: (brand === "Xiaomi" OR brand === "Samsung") AND cost < 200.
const filterGroup = {
    type: "GROUP",
    operator: "AND",
    children: [
      {
        type: "FILTER",
        field: "cost",
        operation: "LESS_THAN",
        value: 200
      },
      {
        type: "GROUP",
        operator: "OR",
        children: [
          {
            type: "FILTER",
            field: "brand",
            operation: "EQUALS",
            value: "Samsung"
          },
          {
            type: "FILTER",
            field: "brand",
            operation: "EQUALS",
            value: "Xiaomi"
          }
        ]
      }
    ]
  }
```
\*the **products** are from example 2.
```
import { equals, lessThan, initializeOperationsG } from "compare-object-field";

// Again, we save operations and addFilterGroup for later.
const operations = {
  EQUALS: equals,
  LESS_THAN: lessThan,
};
const addFilterGroup = initializeOperationsG(operations);

const satisfiesFilterGroup = addFilterGroup(filterGroup);
const xiaomiOrSamsungUnder200 = products.filter(satisfiesFilterGroup); // Xiaomi Redmi Note 5.
```

## The actual function:

```
const compareFieldToValue = operation => field => value => object => operation(
  object[field],
  value,
);
```

It compares an object's field to a value and returns true or false. It's a curried function that takes 4 arguments.

- The **operation** which is a **function** that you can import (import { operationName } from "compare-object-field"), or create your own. It basically compares two things and returns true or false. The available operations are:

```
    * equals = (a, b) => a === b;
    * notEquals = (a, b) => a !== b;
    * greaterThan = (a, b) => a > b;
    * lessThan = (a, b) => a < b;
    * includes = (a, b) => a.includes(b);
    * notIncludes = (a, b) => !a.includes(b);
    * isIncludedIn = (a, b) => b.includes(a);
    * notIncludedIn = (a, b) => !b.includes(a);
    * match = (a, b) => !!a.match(new RegExp(b, 'gi'));
    * notMatch = (a, b) => !a.match(new RegExp(b, 'gi'));
    * matchCaseSensitive = (a, b) => !!a.match(new RegExp(b, 'g'));
    * isEven = a => a % 2 === 0;
    * isOdd = a => a % 2 !== 0;
```

- The object's **field name** which is a **string**. For example 'cost' for product.cost.
- The **value** you want to compare to, which can be **anything**.
- And the actual **object**.

## A use case for the generic form

Say we have the previous array of products and we want to filter them based on some filters. Those filters can be as **many** as the different field values of the products. They could be **stored** in a database or be **dynamically generated**. So for example we may end up with the following filters:

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

Then we "change" the names of the operations we imported to the names of the operations from the data and store them as a global variable.

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

or you can use the **implemented method**:

```
import { initializeOperations } from "compare-object-field"

// we save this as a global variable along with the operations.
const addFilters = initializeOperations(operations);

// The following lines will be called every time we want to search with different filters.
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

- Code reusability.
- More expressive and easier to read code.
- Easier to test.

> Disclaimer: Probably all this is b**\*\***t and there's a library or a design pattern that does the same thing better, but i wanted to share.
