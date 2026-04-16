import { getRuleByNameAndMode } from './validate';

const holderNameValidationFn = getRuleByNameAndMode('holderName', 'blur');
const taxNumValidationFn = getRuleByNameAndMode('taxNumber', 'blur');

describe('validate holder name', () => {
    test('validates a card holder name', () => {
        expect(holderNameValidationFn?.('', null)).toBe(null);
        expect(holderNameValidationFn?.('John Smith', null)).toBe(true);
        expect(holderNameValidationFn?.('   ', null)).toBe(null);
        // expect(validateHolderName(undefined)).toBe(false);
        // expect(validateHolderName(null)).toBe(false);
    });
});

describe('validate tax number', () => {
    test('validates a tax number is 6 or 10 digits', () => {
        expect(taxNumValidationFn?.('', null)).toBe(null);
        expect(taxNumValidationFn?.('12345', null)).toBe(false);
        expect(taxNumValidationFn?.('123456', null)).toBe(true);
        expect(taxNumValidationFn?.('1234567', null)).toBe(false);
        expect(taxNumValidationFn?.('1234567890', null)).toBe(true);
    });
});
