import { getRuleByNameAndMode } from './validate';

const holderNameValidationFn = getRuleByNameAndMode('holderName', 'blur');
const taxNumValidationFn = getRuleByNameAndMode('taxNumber', 'blur');

describe('validate holder name', () => {
    test('validates a card holder name', () => {
        expect(holderNameValidationFn('')).toBe(null);
        expect(holderNameValidationFn('John Smith')).toBe(true);
        expect(holderNameValidationFn('   ')).toBe(null);
        // expect(validateHolderName(undefined)).toBe(false);
        // expect(validateHolderName(null)).toBe(false);
    });
});

describe('validate tax number', () => {
    test('validates a tax number is 6 or 10 digits', () => {
        expect(taxNumValidationFn('')).toBe(null);
        expect(taxNumValidationFn('12345')).toBe(false);
        expect(taxNumValidationFn('123456')).toBe(true);
        expect(taxNumValidationFn('1234567')).toBe(false);
        expect(taxNumValidationFn('1234567890')).toBe(true);
    });
});
