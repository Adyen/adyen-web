import { trimValWithOneSpace } from './validator-utils';

describe('trimValWithOneSpace', () => {
    test('Should clear whitespace from both ends', () => {
        expect(trimValWithOneSpace('  A99 9AA  ')).toBe('A99 9AA');
    });

    test('Should replace multiple spaces with one', () => {
        expect(trimValWithOneSpace('A99   9AA')).toBe('A99 9AA');
    });

    test('Should not change a string with no whitespace', () => {
        expect(trimValWithOneSpace('A99 9AA')).toBe('A99 9AA');
    });

    test('Should trim both ends and clean up multiple spaces', () => {
        expect(trimValWithOneSpace('  A99   9AA  ')).toBe('A99 9AA');
    });
});
