/**
 * A generic curried function that compares an object's field
 * value to a value. You pass in order an operation (a function that will compare two things),
 * a field name (string)  a value (it can be anything) and finally
 * the actual object. Check the documentation https://www.npmjs.com/package/compare-object-field
 * to get ideas how to use it.
 * @param {Function} operation
 * @param {String} field
 * @param {*} value
 * @param {Object} object
 */
const compareFieldToValue = operation => field => value => object => operation(
  object[field],
  value,
);

/**
 * Predefined operations.
 */
const equals = (a, b) => a === b;
const notEquals = (a, b) => a !== b;
const greaterThan = (a, b) => a > b;
const lessThan = (a, b) => a < b;
const includes = (a, b) => a.includes(b);
const notIncludes = (a, b) => !a.includes(b);
const isIncludedIn = (a, b) => b.includes(a);
const notIncludedIn = (a, b) => !b.includes(a);
const match = (a, b) => !!a.match(new RegExp(b, 'gi'));
const notMatch = (a, b) => !a.match(new RegExp(b, 'gi'));
const matchCaseSensitive = (a, b) => !!a.match(new RegExp(b, 'g'));
const isEven = a => a % 2 === 0;
const isOdd = a => a % 2 !== 0;

/**
 * This method assumes that an operations object has the following structure:
 * const operations = {
 *   EQUALS: equals (function),
 *   GREATER_THAN: greaterThan(function)
 * }
 *
 * and filters is an array of objects with the following structure:
 * const filter = {
 *   operation: 'EQUALS', (a field NAME from OPERATIONS)
 *   field: 'cost', (a field NAME from the OBJECT)
 *   value: 30 (a field VALUE from the OBJECT)
 * }
 * @param {Object} operations
 * @param {Array} filters
 * @param {boolean} satisfyAllFilters
 */
const initializeOperations = operations => (filters, satisfyAllFilters = true) => {
  const allFiltersTrue = object => filters.reduce(
    (result, filter) => (result
      ? compareFieldToValue(operations[filter.operation])(filter.field)(filter.value)(object)
      : false),
    true,
  );
  const oneFilterTrue = object => filters.reduce(
    (result, filter) => (result
      ? true
      : compareFieldToValue(operations[filter.operation])(filter.field)(filter.value)(object)),
    false,
  );
  return satisfyAllFilters ? allFiltersTrue : oneFilterTrue;
};

export default compareFieldToValue;

export {
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
  initializeOperations,
};
