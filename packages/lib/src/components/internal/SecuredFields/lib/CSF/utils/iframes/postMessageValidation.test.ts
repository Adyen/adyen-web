import { isWebpackPostMsg, isChromeVoxPostMsg } from './postMessageValidation';

describe('postMessageValidation', () => {
    describe('isWebpackPostMsg', () => {
        test('should return true for webpackHotUpdate messages', () => {
            const event = { data: { type: 'webpackHotUpdate' } } as MessageEvent;
            expect(isWebpackPostMsg(event)).toBe(true);
        });

        test('should return true when type contains webpack', () => {
            const event = { data: { type: 'webpackOk' } } as MessageEvent;
            expect(isWebpackPostMsg(event)).toBe(true);
        });

        test('should return false for non-webpack messages', () => {
            const event = { data: { type: 'other' } } as MessageEvent;
            expect(isWebpackPostMsg(event)).toBe(false);
        });

        test('should return false when data is null', () => {
            const event = { data: null } as MessageEvent;
            expect(isWebpackPostMsg(event)).toBeFalsy();
        });

        test('should return false when data has no type', () => {
            const event = { data: {} } as MessageEvent;
            expect(isWebpackPostMsg(event)).toBeFalsy();
        });

        test('should return false when type is not a string', () => {
            const event = { data: { type: 123 } } as MessageEvent;
            expect(isWebpackPostMsg(event)).toBeFalsy();
        });
    });

    describe('isChromeVoxPostMsg', () => {
        test('should return true for cvox messages', () => {
            const event = { data: 'cvox_node_changed' } as MessageEvent;
            expect(isChromeVoxPostMsg(event)).toBe(true);
        });

        test('should return true when data string contains cvox', () => {
            const event = { data: 'some_cvox_event' } as MessageEvent;
            expect(isChromeVoxPostMsg(event)).toBe(true);
        });

        test('should return false for non-cvox string messages', () => {
            const event = { data: 'some_other_message' } as MessageEvent;
            expect(isChromeVoxPostMsg(event)).toBe(false);
        });

        test('should return false when data is null', () => {
            const event = { data: null } as MessageEvent;
            expect(isChromeVoxPostMsg(event)).toBeFalsy();
        });

        test('should return false when data is undefined', () => {
            const event = { data: undefined } as MessageEvent;
            expect(isChromeVoxPostMsg(event)).toBeFalsy();
        });

        test('should return false when data is not a string', () => {
            const event = { data: { type: 'cvox' } } as MessageEvent;
            expect(isChromeVoxPostMsg(event)).toBeFalsy();
        });
    });
});
