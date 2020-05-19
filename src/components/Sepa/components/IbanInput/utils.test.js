import { electronicFormat, formatIban, getIbanPlaceHolder, getNextCursorPosition } from './utils';

const VALID_IBAN = 'NL13TEST0123456789';
const INVALID_IBAN = 'NL13TEST0123456788@!';
const countryCode = 'NL';
const noCountryCode = '';

describe('IBAN Utils', () => {
    describe('electronicFormat', () => {
        test('Cleans up any non alphanumeric characters', () => {
            expect(electronicFormat(VALID_IBAN)).toBe('NL13TEST0123456789');
            expect(electronicFormat(INVALID_IBAN)).toBe('NL13TEST0123456788');
            expect(electronicFormat('BE68539007547034')).toBe('BE68539007547034');
            expect(electronicFormat('BE68 5390 0754 7034')).toBe('BE68539007547034');
        });
    });

    describe('formatIban', () => {
        test('Formats an IBAN', () => {
            expect(formatIban(VALID_IBAN)).toBe('NL13 TEST 0123 4567 89');
            expect(formatIban(INVALID_IBAN)).toBe('NL13 TEST 0123 4567 88');
        });
    });

    describe('getIbanPlaceHolder', () => {
        test('Returns an example', () => {
            expect(getIbanPlaceHolder(countryCode)).toBe('NL99 BANK 0123 4567 89');
            expect(getIbanPlaceHolder(noCountryCode)).toBe('AB00 1234 5678 9012 3456 7890');
            expect(getIbanPlaceHolder()).toBe('AB00 1234 5678 9012 3456 7890');
        });
    });

    describe('getNextCursorPosition', () => {
        test('Jumps one position forward', () => {
            const cursor = getNextCursorPosition(4, 'NL12', 'NL1');
            expect(cursor).toBe(4);
        });

        test('Jumps one space forward', () => {
            const cursor = getNextCursorPosition(5, 'NL12 4', 'NL12');
            expect(cursor).toBe(6);
        });

        test('Handles removing a block of text', () => {
            const cursor = getNextCursorPosition(4, 'NL13', 'NL13 TEST 0123 4567 89');
            expect(cursor).toBe(4);
        });

        test('Handles removing a block of text', () => {
            const cursor = getNextCursorPosition(4, 'NL13', 'NL13 TEST 0123 4567 89');
            expect(cursor).toBe(4);
        });
    });
});
