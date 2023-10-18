/* global expect, describe, jest, beforeEach */

import { falsy, notFalsy, generateRandomNumber, objectsDeepEqual } from './commonUtils';

beforeEach(() => {
    console.error = jest.fn(error => {
        throw new Error(error);
    });
    console.log = jest.fn(() => {});
});

describe('Tests for commonUtils', () => {
    test('Should test falsy - with values we expect to be falsy', () => {
        expect(falsy(0)).toBe(true);
        expect(falsy('')).toBe(true);
        expect(falsy({})).toBe(true);
        expect(falsy([])).toBe(true);
        expect(falsy(false)).toBe(true);
        expect(falsy(NaN)).toBe(true);
        expect(falsy(null)).toBe(true);
        expect(falsy(undefined)).toBe(true);
    });

    test('Should test falsy - with values we expect NOT to be falsy', () => {
        expect(falsy(1)).toBe(false);
        expect(falsy('foo')).toBe(false);
        expect(falsy({ bar: 42 })).toBe(false);
        expect(falsy([42])).toBe(false);
        expect(falsy(true)).toBe(false);
    });

    test('Should test notFalsy - with values we expect to be true', () => {
        expect(notFalsy(1)).toBe(true);
        expect(notFalsy('foo')).toBe(true);
        expect(notFalsy({ bar: 42 })).toBe(true);
        expect(notFalsy([42])).toBe(true);
        expect(notFalsy(true)).toBe(true);
    });

    test('Should test generateRandomNumber', () => {
        expect(typeof generateRandomNumber()).toEqual('number');
    });
});

/**
 * Testing objectsDeepEqual
 */

///////////////// EQUALITY /////////////////

describe('objectsDeepEqual tests - Batch 1: expect equality with objects', () => {
    test('test empty objects are seen as equal', () => {
        const objA = {};
        const objB = {};

        const areEqual = objectsDeepEqual(objA, objB);
        expect(areEqual).toBe(true);
    });

    test('test 2 nulls are seen as equal', () => {
        const objA = null;
        const objB = null;

        const areEqual = objectsDeepEqual(objA, objB);
        expect(areEqual).toBe(true);
    });

    test('test empty array & empty object are seen as equal (they are both typeof "object")', () => {
        const objA = [];
        const objB = {};

        const areEqual = objectsDeepEqual(objA, objB);
        expect(areEqual).toBe(true);
    });

    test('test objects with same key:values are seen as equal', () => {
        const objA = {
            street: 'a street',
            houseNumberOrName: '11',
            postalCode: '10814',
            city: 'chicago'
        };
        const objB = {
            street: 'a street',
            houseNumberOrName: '11',
            postalCode: '10814',
            city: 'chicago'
        };

        const areEqual = objectsDeepEqual(objA, objB);
        expect(areEqual).toBe(true);
    });

    test('test objects with same key:values, including nested objects,  are seen as equal', () => {
        const objA = {
            street: 'a street',
            houseNumberOrName: '11',
            postalCode: '10814',
            city: 'chicago',
            country: { land: 'US', hemisphere: 'N' }
        };
        const objB = {
            street: 'a street',
            houseNumberOrName: '11',
            postalCode: '10814',
            city: 'chicago',
            country: { land: 'US', hemisphere: 'N' }
        };

        const areEqual = objectsDeepEqual(objA, objB);
        expect(areEqual).toBe(true);
    });
});

describe('objectsDeepEqual tests - Batch 2: expect equality with arrays', () => {
    test('test empty arrays are seen as equal', () => {
        const objA = [];
        const objB = [];

        const areEqual = objectsDeepEqual(objA, objB);
        expect(areEqual).toBe(true);
    });

    test('test arrays are seen as equal', () => {
        const objA = ['af', '+93', 'gz', '+99'];
        const objB = ['af', '+93', 'gz', '+99'];

        const areEqual = objectsDeepEqual(objA, objB);
        expect(areEqual).toBe(true);
    });

    test('test arrays of objects are seen as equal', () => {
        const objA = [
            { id: 'af', name: '+93' },
            { id: 'gz', name: '+99' }
        ];
        const objB = [
            { id: 'af', name: '+93' },
            { id: 'gz', name: '+99' }
        ];

        const areEqual = objectsDeepEqual(objA, objB);
        expect(areEqual).toBe(true);
    });

    test('test arrays of objects, including nested objects, are seen as equal', () => {
        const objA = [
            { id: 'af', name: '+93' },
            { id: 'gz', name: '+99' },
            { id: 'country', value: { land: 'US' } }
        ];
        const objB = [
            { id: 'af', name: '+93' },
            { id: 'gz', name: '+99' },
            { id: 'country', value: { land: 'US' } }
        ];

        const areEqual = objectsDeepEqual(objA, objB);
        expect(areEqual).toBe(true);
    });
});

///////////////// NON-EQUALITY /////////////////
describe('objectsDeepEqual tests - Batch 3: expect no equality with objects', () => {
    test('test null & an empty object are not seen as equal', () => {
        const objA = {};
        const objB = null;

        const areEqual = objectsDeepEqual(objA, objB);
        expect(areEqual).toBe(false);
    });

    test('test objects with same keys but a different value for one of the keys are not seen as equal', () => {
        const objA = {
            street: 'a street',
            houseNumberOrName: '11',
            postalCode: '10814',
            city: 'chicago'
        };
        const objB = {
            street: 'a street',
            houseNumberOrName: '11',
            postalCode: '10814',
            city: null
        };

        const areEqual = objectsDeepEqual(objA, objB);
        expect(areEqual).toBe(false);
    });

    test('test objects with different keys are not seen as equal', () => {
        const objA = {
            street: 'a street',
            houseNumberOrName: '11',
            postalCode: '10814',
            city: 'chicago',
            country: 'US'
        };
        const objB = {
            street: 'a street',
            houseNumberOrName: '11',
            postalCode: '10814',
            city: 'chicago'
        };

        const areEqual = objectsDeepEqual(objA, objB);
        expect(areEqual).toBe(false);
    });

    test('test objects with nested objects with different values are not seen as equal', () => {
        const objA = {
            street: 'a street',
            houseNumberOrName: '11',
            postalCode: '10814',
            city: 'chicago',
            country: { land: 'US', hemisphere: 'N' }
        };
        const objB = {
            street: 'a street',
            houseNumberOrName: '11',
            postalCode: '10814',
            city: 'chicago',
            country: { land: 'CA', hemisphere: 'N' }
        };

        const areEqual = objectsDeepEqual(objA, objB);
        expect(areEqual).toBe(false);
    });
});

describe('objectsDeepEqual tests - Batch 3: expect no equality with array', () => {
    test('test arrays with different lengths are not seen as equal', () => {
        const objA = ['af', '+93', 'gz', '+99'];
        const objB = ['af', '+93', 'gz'];

        const areEqual = objectsDeepEqual(objA, objB);
        expect(areEqual).toBe(false);
    });

    test('test arrays with different values are not seen as equal', () => {
        const objA = ['af', '+93', 'gz', '+99'];
        const objB = ['af', '+93', 'gz', '+91'];

        const areEqual = objectsDeepEqual(objA, objB);
        expect(areEqual).toBe(false);
    });

    test('test arrays of different objects are not seen as equal', () => {
        const objA = [
            { id: 'af', name: '+93' },
            { id: 'gz', name: '+99' },
            { id: 'gb', name: '+90' }
        ];
        const objB = [
            { id: 'af', name: '+93' },
            { id: 'gz', name: '+99' }
        ];

        const areEqual = objectsDeepEqual(objA, objB);
        expect(areEqual).toBe(false);
    });

    test('test arrays of objects, including nested objects with different values, are not seen as equal', () => {
        const objA = [
            { id: 'af', name: '+93' },
            { id: 'gz', name: '+99' },
            { id: 'country', value: { land: 'US' } }
        ];
        const objB = [
            { id: 'af', name: '+93' },
            { id: 'gz', name: '+99' },
            { id: 'country', value: { land: 'MX' } }
        ];

        const areEqual = objectsDeepEqual(objA, objB);
        expect(areEqual).toBe(false);
    });
});
