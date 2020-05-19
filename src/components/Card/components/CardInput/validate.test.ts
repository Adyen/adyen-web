import { validateHolderName } from './validate';

describe('validateHolderName', () => {
    test('validates a required card holder name', () => {
        expect(validateHolderName('', true)).toBe(false);
        expect(validateHolderName('John Smith', true)).toBe(true);
        expect(validateHolderName(undefined, true)).toBe(false);
        expect(validateHolderName(null, true)).toBe(false);
    });

    test('validates a non-required card holder name', () => {
        expect(validateHolderName('', false)).toBe(true);
        expect(validateHolderName('John Smith', false)).toBe(true);
    });
});
