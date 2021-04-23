import { getRuleByNameAndMode } from './validate';

const holderNameValidationFn = getRuleByNameAndMode('holderName', 'blur');

describe('validateHolderName', () => {
    test('validates a required card holder name', () => {
        expect(holderNameValidationFn('')).toBe(false);
        expect(holderNameValidationFn('John Smith')).toBe(true);
        // expect(validateHolderName(undefined)).toBe(false);
        // expect(validateHolderName(null)).toBe(false);
    });
});
