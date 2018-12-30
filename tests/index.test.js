import {
  compareFieldToValue,
  initializeOperations,
  initializeOperationsG,
  equals,
  notEquals,
  greaterThan,
  lessThan,
  includes,
  notIncludes,
  isIncludedIn,
  notIncludedIn,
  match,
  notMatch,
  matchCaseSensitive,
  isEven,
  isOdd,
} from '../src/index';
import cards from './data/hearthstone-cards.json';
import filterGroups from './data/filter-groups.json';

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

test('README example #1', () => {
  const person = { name: 'John' };
  const result = compareFieldToValue(equals)('name')('John')(person);

  expect(result).toBe(true);
});

test('README example #2', () => {
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

test('README example #3 (with map)', () => {
  const currentFilters = [
    { field: 'year', operation: 'EQUALS', value: 2016 },
    { field: 'cost', operation: 'GREATER_THAN', value: 500 },
  ];

  const operations = {
    EQUALS: equals,
    GREATER_THAN: greaterThan,
  };

  const satisfiesAllFilters = (product, filters) =>
    !filters
      .map(filter =>
        compareFieldToValue(operations[filter.operation])(filter.field)(filter.value)(product),
      )
      .includes(false);

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

test('README example #3 (with reduce)', () => {
  const currentFilters = [
    { field: 'year', operation: 'EQUALS', value: 2016 },
    { field: 'cost', operation: 'GREATER_THAN', value: 500 },
  ];

  const operations = {
    EQUALS: equals,
    GREATER_THAN: greaterThan,
  };

  const satisfiesAllFilters = (product, filters) =>
    filters.reduce(
      (result, filter) =>
        result
          ? compareFieldToValue(operations[filter.operation])(filter.field)(filter.value)(product)
          : result,
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

test('README example #3 (with implemented method)', () => {
  const currentFilters = [
    { field: 'year', operation: 'EQUALS', value: 2016 },
    { field: 'cost', operation: 'GREATER_THAN', value: 500 },
  ];

  const operations = {
    EQUALS: equals,
    GREATER_THAN: greaterThan,
  };

  const addFilters = initializeOperations(operations);
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

test('README example #4', () => {
  const filterGroup = {
    type: 'GROUP',
    operator: 'AND',
    children: [
      {
        type: 'FILTER',
        field: 'cost',
        operation: 'LESS_THAN',
        value: 200,
      },
      {
        type: 'GROUP',
        operator: 'OR',
        children: [
          {
            type: 'FILTER',
            field: 'brand',
            operation: 'EQUALS',
            value: 'Samsung',
          },
          {
            type: 'FILTER',
            field: 'brand',
            operation: 'EQUALS',
            value: 'Xiaomi',
          },
        ],
      },
    ],
  };

  const operations = {
    EQUALS: equals,
    LESS_THAN: lessThan,
  };

  const addFilterGroup = initializeOperationsG(operations);
  const satisfiesFilterGroup = addFilterGroup(filterGroup);
  const xiaomiOrSamsungUnder200 = products.filter(satisfiesFilterGroup);

  expect(xiaomiOrSamsungUnder200).toEqual([
    {
      name: 'Xiaomi Redmi Note 5',
      brand: 'Xiaomi',
      cost: 180,
      year: 2018,
    },
  ]);
});

const operations = {
  EQUALS: equals,
  NOT_EQUALS: notEquals,
  GREATER_THAN: greaterThan,
  INCLUDES: includes,
};
const addFilterGroup = initializeOperationsG(operations);

it('filterGroup test #1: Filter the standard Druid cards.', () => {
  const filterGroup = filterGroups[0];
  const filterCards = addFilterGroup(filterGroup);
  const standardDruidCards = cards.filter(filterCards);
  expect(standardDruidCards.length).toEqual(448);
});

it('filterGroup test #2: Filter the standard Neutral cards', () => {
  const filterGroup = filterGroups[1];
  const filterCards = addFilterGroup(filterGroup);
  const standardNeutral = cards.filter(filterCards);
  expect(standardNeutral.length).toEqual(373);
});

it('filterGroup test #3: Filter Whizbang', () => {
  const filterGroup = filterGroups[2];
  const filterCards = addFilterGroup(filterGroup);
  const whizbang = cards.filter(filterCards);
  expect(whizbang.length).toEqual(1);
});

it('filterGroup test #4: Available cards for Prince Keleseth', () => {
  const filterGroup = filterGroups[3];
  const filterCards = addFilterGroup(filterGroup);
  const princeKelesethCards = cards.filter(filterCards);
  expect(princeKelesethCards.length).toEqual(1420);
});

test('equals operation #1', () => {
  const a = 1;
  const b = 1;
  expect(equals(a, b)).toEqual(true);
});

test('equals operation #2', () => {
  const a = 'text';
  const b = 'text';
  expect(equals(a, b)).toEqual(true);
});

test('equals operation #3', () => {
  const a = { type: 'text' };
  const b = a;
  expect(equals(a, b)).toEqual(true);
});

test('equals operation #4', () => {
  const a = [1, 2, 3];
  const b = a;
  expect(equals(a, b)).toEqual(true);
});

test('notEquals operation #1', () => {
  const a = 1;
  const b = 2;
  expect(notEquals(a, b)).toEqual(true);
});

test('notEquals operation #2', () => {
  const a = 'text';
  const b = 'video';
  expect(notEquals(a, b)).toEqual(true);
});

test('notEquals operation #3', () => {
  const a = { type: 'text' };
  const b = { type: 'text' };
  expect(notEquals(a, b)).toEqual(true);
});

test('notEquals operation #4', () => {
  const a = [1, 2, 3];
  const b = [1, 2, 3];
  expect(notEquals(a, b)).toEqual(true);
});

test('greaterThan operation #1', () => {
  const a = 2;
  const b = 1;
  expect(greaterThan(a, b)).toEqual(true);
});

test('greaterThan operation #2', () => {
  const a = 'video';
  const b = 'text';
  expect(greaterThan(a, b)).toEqual(true);
});

test('greaterThan operation #3', () => {
  const a = { type: 'text' };
  const b = { type: 'video' };
  expect(greaterThan(a, b)).toEqual(false);
});

test('greaterThan operation #4', () => {
  const a = [1, 2, 3, 4];
  const b = [1, 2, 3];
  expect(greaterThan(a, b)).toEqual(true);
});

test('lessThan operation #1', () => {
  const a = 1;
  const b = 1.1;
  expect(lessThan(a, b)).toEqual(true);
});

test('lessThan operation #2', () => {
  const a = 'GIF';
  const b = 'text';
  expect(lessThan(a, b)).toEqual(true);
});

test('lessThan operation #3', () => {
  const a = { type: 'text' };
  const b = { type: 'video' };
  expect(lessThan(a, b)).toEqual(false);
});

test('lessThan operation #4', () => {
  const a = [1, 2];
  const b = ['1', '2', '3'];
  expect(lessThan(a, b)).toEqual(true);
});

test('includes operation #1', () => {
  const a = 'My name is John';
  const b = 'John';
  expect(includes(a, b)).toEqual(true);
});

test('includes operation #2', () => {
  const a = 'My name is John';
  const b = 'Mark';
  expect(includes(a, b)).toEqual(false);
});

test('includes operation #3', () => {
  const a = [1, 2, 3];
  const b = [1];
  expect(includes(a, b)).toEqual(false);
});

test('includes operation #4', () => {
  const a = [1, 2, 3];
  const b = 2;
  expect(includes(a, b)).toEqual(true);
});

test('notIncludes operation #1', () => {
  const a = 'My name is John';
  const b = 'Mark';
  expect(notIncludes(a, b)).toEqual(true);
});

test('notIncludes operation #2', () => {
  const a = [1, 2, 3];
  const b = 4;
  expect(notIncludes(a, b)).toEqual(true);
});

test('notIncludes operation #3', () => {
  const a = [1, 2, 3];
  const b = true;
  expect(notIncludes(a, b)).toEqual(true);
});

test('isIncludedIn operation #1', () => {
  const a = 1;
  const b = [1, 2, 3];
  expect(isIncludedIn(a, b)).toEqual(true);
});

test('isIncludedIn operation #2', () => {
  const a = 4;
  const b = [1, 2, 3];
  expect(isIncludedIn(a, b)).toEqual(false);
});

test('isIncludedIn operation #3', () => {
  const a = 'a';
  const b = [1, 2, 3];
  expect(isIncludedIn(a, b)).toEqual(false);
});

test('isIncludedIn operation #4', () => {
  const a = [1];
  const b = [1, 2, 3];
  expect(isIncludedIn(a, b)).toEqual(false);
});

test('notIncludedIn operation #1', () => {
  const a = 1;
  const b = [1, 2, 3];
  expect(notIncludedIn(a, b)).toEqual(false);
});

test('notIncludedIn operation #2', () => {
  const a = 4;
  const b = [1, 2, 3];
  expect(notIncludedIn(a, b)).toEqual(true);
});

test('notIncludedIn operation #3', () => {
  const a = 'a';
  const b = [1, 2, 3];
  expect(notIncludedIn(a, b)).toEqual(true);
});

test('notIncludedIn operation #4', () => {
  const a = [1];
  const b = [1, 2, 3];
  expect(notIncludedIn(a, b)).toEqual(true);
});

test('match operation #1', () => {
  const a = 'My name is Mark';
  const b = 'Mark';
  expect(match(a, b)).toEqual(true);
});

test('match operation #2', () => {
  const a = 'My name is Mark';
  const b = 'Jack';
  expect(match(a, b)).toEqual(false);
});

test('match operation #3', () => {
  const a = 'My name is Mark';
  const b = '\\d+';
  expect(match(a, b)).toEqual(false);
});

test('match operation #4', () => {
  const a = 'My name is Mark';
  const b = '\\w+';
  expect(match(a, b)).toEqual(true);
});

test('match operation #5', () => {
  const a = '1';
  const b = '\\d+';
  expect(match(a, b)).toEqual(true);
});

test('notMatch operation #1', () => {
  const a = 'My name is Mark';
  const b = 'Mark';
  expect(notMatch(a, b)).toEqual(false);
});

test('notMatch operation #2', () => {
  const a = 'My name is Mark';
  const b = 'Jack';
  expect(notMatch(a, b)).toEqual(true);
});

test('notMatch operation #3', () => {
  const a = 'My name is Mark';
  const b = '\\d+';
  expect(notMatch(a, b)).toEqual(true);
});

test('notMatch operation #4', () => {
  const a = 'My name is Mark';
  const b = '\\w+';
  expect(notMatch(a, b)).toEqual(false);
});

test('notMatch operation #5', () => {
  const a = '1';
  const b = '\\d+';
  expect(notMatch(a, b)).toEqual(false);
});

test('matchCaseSensitive operation #1', () => {
  const a = 'John doe';
  const b = 'john';
  expect(matchCaseSensitive(a, b)).toEqual(false);
});

test('matchCaseSensitive operation #2', () => {
  const a = 'John doe';
  const b = 'John';
  expect(matchCaseSensitive(a, b)).toEqual(true);
});

test('isEven operation #1', () => {
  const a = 'Mark';
  expect(isEven(a)).toEqual(false);
});

test('isEven operation #2', () => {
  const a = 4;
  expect(isEven(a)).toEqual(true);
});

test('isEven operation #3', () => {
  const a = 5;
  expect(isEven(a)).toEqual(false);
});

test('isEven operation #4', () => {
  const a = [2, 4];
  expect(isEven(a)).toEqual(false);
});

test('isEven operation #5', () => {
  const a = 2.0;
  expect(isEven(a)).toEqual(true);
});

test('isEven operation #6', () => {
  const a = 2.1;
  expect(isEven(a)).toEqual(false);
});

test('isOdd operation #1', () => {
  const a = 3;
  expect(isOdd(a)).toEqual(true);
});

test('isOdd operation #2', () => {
  const a = 22;
  expect(isOdd(a)).toEqual(false);
});

// needs input validation
test('isOdd operation #3', () => {
  const a = 'odd';
  expect(isOdd(a)).toEqual(true);
});

// needs input validation
test('isOdd operation #4', () => {
  const a = 'even';
  expect(isOdd(a)).toEqual(true);
});
