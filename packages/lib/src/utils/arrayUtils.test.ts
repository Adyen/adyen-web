import { getArrayDifferences } from './arrayUtils';

describe('getArrayDifferences', () => {
    const first = { field: 'a', id: 1 };
    const second = { field: 'b', id: 2 };
    const third = { field: 'c', id: 3 };

    test('should return the current array when it has one item and there is no previous array', () => {
        expect(getArrayDifferences([first], undefined, 'field')).toEqual([first]);
        expect(getArrayDifferences([first], null, 'field')).toEqual([first]);
    });

    test('should return nothing when there is no previous array and the current array has several items', () => {
        expect(getArrayDifferences([first, second], undefined, 'field')).toBeUndefined();
        expect(getArrayDifferences([first, second], null, 'field')).toBeUndefined();
    });

    test('should return the items that are not in the previous array, compared by the given key', () => {
        expect(getArrayDifferences([first, second, third], [first], 'field')).toEqual([second, third]);
    });

    test('should compare by id when no key is given', () => {
        expect(getArrayDifferences([first, second], [first])).toEqual([second]);
    });

    test('should return nothing when the current array is not longer than the previous array', () => {
        expect(getArrayDifferences([first], [first], 'field')).toBeUndefined();
        expect(getArrayDifferences([first], [first, second], 'field')).toBeUndefined();
    });
});
