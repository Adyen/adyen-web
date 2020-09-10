import { formatDate, unformatDate } from './utils';

describe('InputDate utils', () => {
    describe('formatDate', () => {
        test('accepts digits only', () => {
            expect(formatDate('a')).toBe('');
        });

        test('replaces double zeros in days and months', () => {
            expect(formatDate('00')).toBe('01');
            expect(formatDate('00/00')).toBe('01/01');
        });

        test('adds a zero in front of single digit days/months only when necessary', () => {
            expect(formatDate('2')).toBe('2');
            expect(formatDate('4')).toBe('04');
            expect(formatDate('02/1')).toBe('02/1');
            expect(formatDate('02/2')).toBe('02/02');
        });

        test('forces up to day 29 for February', () => {
            expect(formatDate('30/02')).toBe('29/02');
            expect(formatDate('31/02')).toBe('29/02');
        });

        test('adds slashes correctly', () => {
            expect(formatDate('2211')).toBe('22/11');
            expect(formatDate('22111990')).toBe('22/11/1990');
        });
    });

    describe('unformatDate', () => {
        test('unformats date correctly', () => {
            expect(unformatDate('01/02/2003')).toBe('2003-02-01');
        });

        test('returns the same value if no slashes are found', () => {
            expect(unformatDate('2003-02-01')).toBe('2003-02-01');
        });
    });
});
