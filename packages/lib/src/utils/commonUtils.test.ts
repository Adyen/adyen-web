/* global expect, describe, jest, beforeEach */

import { falsy, notFalsy } from './commonUtils';

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
});
