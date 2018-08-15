import compareFieldToValue, { equals, lessThan, greaterThan, addOperations } from '../src/index';

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

test('simple example #1', () => {
  const person = { name: 'John' };
  const result = compareFieldToValue(equals)('name')('John')(person);

  expect(result).toBe(true);
});

test('simple example #2', () => {
  const fieldLessThan = compareFieldToValue(lessThan); // We can use it later on other objects
  const costLessThan200 = fieldLessThan('cost')(200);

  const productsUnder200 = products.filter(costLessThan200);

  expect(productsUnder200).toEqual([
    {
      name: 'Xiaomi Redmi Note 5',
      brand: 'Xiaomi',
      cost: 180,
      year: 2018,
    },
  ]);
});

test('use case generic form with map', () => {

  const currentFilters = [
    { field: 'year', operation: 'EQUALS', value: 2016 },
    { field: 'cost', operation: 'GREATER_THAN', value: 500 },
  ];

  const operations = {
    EQUALS: equals,
    GREATER_THAN: greaterThan,
  };

  const satisfiesAllFilters = (product, filters) => !filters.map(
    filter => compareFieldToValue(operations[filter.operation])(filter.field)(filter.value)(product)
  ).includes(false);

  const badPurchase = products.filter(product => satisfiesAllFilters(product, currentFilters));

  expect(badPurchase).toEqual([
    {
      name: 'Apple iPhone 7',
      brand: 'Apple',
      cost: 513,
      year: 2016,
    },
  ]);
});

test('use case generic form with reduce', () => {

  const currentFilters = [
    { field: 'year', operation: 'EQUALS', value: 2016 },
    { field: 'cost', operation: 'GREATER_THAN', value: 500 },
  ];

  const operations = {
    EQUALS: equals,
    GREATER_THAN: greaterThan,
  };

  const satisfiesAllFilters = (product, filters) => filters.reduce(
    (result, filter) => (result
      ? compareFieldToValue(operations[filter.operation])(filter.field)(filter.value)(product)
      : result),
    true,
  );

  const badPurchase = products.filter(product => satisfiesAllFilters(product, currentFilters));

  expect(badPurchase).toEqual([
    {
      name: 'Apple iPhone 7',
      brand: 'Apple',
      cost: 513,
      year: 2016,
    },
  ]);
});

test('use case generic form with predefined method', () => {
  
  const currentFilters = [
    { field: 'year', operation: 'EQUALS', value: 2016 },
    { field: 'cost', operation: 'GREATER_THAN', value: 500 },
  ];

  const operations = {
    EQUALS: equals,
    GREATER_THAN: greaterThan,
  };

  const addFilters = addOperations(operations);
  const satisfiesFilters = addFilters(currentFilters, true);
  const badPurchase = products.filter(satisfiesFilters);

  expect(badPurchase).toEqual([
    {
      name: 'Apple iPhone 7',
      brand: 'Apple',
      cost: 513,
      year: 2016,
    },
  ]);
});
