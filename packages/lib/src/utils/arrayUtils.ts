// Pass 2 arrays of similar objects - and compare for differences
export function getArrayDifferences<A, S extends string>(currentArray: A[], previousArray: A[], comparisonKey?: S): A[] {
    let difference;

    const compKey = comparisonKey || 'id';

    // If nothing to compare - take the new item...
    if (currentArray.length === 1 && !previousArray) {
        difference = currentArray;
    }
    // .. else, find the difference: what's in the new array that wasn't in the old array?
    if (currentArray.length > previousArray?.length) {
        difference = currentArray.filter(({ [compKey]: id1 }) => !previousArray.some(({ [compKey]: id2 }) => id2 === id1));
    }
    return difference;
}
