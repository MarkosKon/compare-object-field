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
export const compareFieldToValue = operation => field => val => object =>
  operation(object[field], val);

/**
 * Predefined operations.
 */
export const equals = (a, b) => a === b;
export const notEquals = (a, b) => a !== b;
export const greaterThan = (a, b) => a > b;
export const lessThan = (a, b) => a < b;
export const includes = (a, b) => a.includes(b);
export const notIncludes = (a, b) => !a.includes(b);
export const isIncludedIn = (a, b) => b.includes(a);
export const notIncludedIn = (a, b) => !b.includes(a);
export const match = (a, b) => !!a.match(new RegExp(b, "gi"));
export const notMatch = (a, b) => !a.match(new RegExp(b, "gi"));
export const matchCaseSensitive = (a, b) => !!a.match(new RegExp(b, "g"));
export const isEven = a => a % 2 === 0;
export const isOdd = a => a % 2 !== 0;

/**
 * Compares objects with an array of filters. The filters can have
 * AND or OR between them. See the documentation for an example.
 * @param {Object} operations
 * @param {Array} filters
 * @param {boolean} satisfyAllFilters
 */
export const initializeOperations = operations => (
  filters,
  satisfyAllFilters = true
) => {
  const allFiltersTrue = object =>
    filters.reduce(
      (result, filter) =>
        result
          ? compareFieldToValue(operations[filter.operation])(filter.field)(
              filter.value
            )(object)
          : false,
      true
    );
  const oneFilterTrue = object =>
    filters.reduce(
      (result, filter) =>
        result
          ? true
          : compareFieldToValue(operations[filter.operation])(filter.field)(
              filter.value
            )(object),
      false
    );
  return satisfyAllFilters ? allFiltersTrue : oneFilterTrue;
};

const isGroup = compareFieldToValue(equals)("type")("GROUP");
const isANDGroup = compareFieldToValue(equals)("operator")("AND");

/**
 * Compares objects with a filter group. The filter group can have filters
 * or other filter groups as children. Additionally the filter group can have
 * AND or OR between the children. See the documentation for an example.
 * @param {Object} operations
 * @param {Object} parentGroup
 * @param {Object} object
 */
export const initializeOperationsG = operations => parentGroup => object => {
  const evaluateFilter = (result, filter, parentIsANDGroup) => {
    const objectSatisfiesFilter = compareFieldToValue(
      operations[filter.operation]
    )(filter.field)(filter.value)(object);
    if (parentIsANDGroup) return result && objectSatisfiesFilter;
    return result || objectSatisfiesFilter;
  };

  const evaluateChildren = parentIsANDGroup => (result, next) => {
    if (isGroup(next)) {
      const groupIsANDGroup = isANDGroup(next);
      const evaluateMoreChildren = next.children.reduce(
        evaluateChildren(groupIsANDGroup),
        groupIsANDGroup
      );
      return parentIsANDGroup
        ? result && evaluateMoreChildren
        : result || evaluateMoreChildren;
    }
    return evaluateFilter(result, next, parentIsANDGroup);
  };

  const parentIsANDGroup = isANDGroup(parentGroup);
  return parentGroup.children.reduce(
    evaluateChildren(parentIsANDGroup),
    parentIsANDGroup
  );
};
