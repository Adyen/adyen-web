import { resolveCVCErrorKey, shouldShowInstallmentsComponent } from './utils';

describe('shouldShowInstallmentsComponent', () => {
    const amount = { value: 1000, currency: 'EUR' };
    const installmentOptions = { card: { values: [1, 2, 3] } };

    describe('when installmentOptions is missing or empty', () => {
        it('should return false if installmentOptions is undefined', () => {
            expect(shouldShowInstallmentsComponent({ amount })).toBe(false);
        });

        it('should return false if installmentOptions is an empty object', () => {
            expect(shouldShowInstallmentsComponent({ installmentOptions: {}, amount })).toBe(false);
        });
    });

    describe('when amount is missing or zero', () => {
        it('should return false if amount is undefined', () => {
            expect(shouldShowInstallmentsComponent({ installmentOptions })).toBe(false);
        });

        it('should return false if amount value is 0', () => {
            expect(shouldShowInstallmentsComponent({ installmentOptions, amount: { value: 0, currency: 'EUR' } })).toBe(false);
        });
    });

    describe('when fundingSource is provided', () => {
        it('should return false if fundingSource is "debit"', () => {
            expect(shouldShowInstallmentsComponent({ installmentOptions, amount, fundingSource: 'debit' })).toBe(false);
        });

        it('should return true if fundingSource is "credit"', () => {
            expect(shouldShowInstallmentsComponent({ installmentOptions, amount, fundingSource: 'credit' })).toBe(true);
        });

        it('should return true if fundingSource is undefined', () => {
            expect(shouldShowInstallmentsComponent({ installmentOptions, amount })).toBe(true);
        });
    });

    describe('when all conditions are met', () => {
        it('should return true with valid installmentOptions and amount', () => {
            expect(shouldShowInstallmentsComponent({ installmentOptions, amount })).toBe(true);
        });

        it('should return true with valid installmentOptions, amount, and credit fundingSource', () => {
            expect(shouldShowInstallmentsComponent({ installmentOptions, amount, fundingSource: 'credit' })).toBe(true);
        });
    });
});

describe('resolveCVCErrorKey', () => {
    it('should return the base error key when isAmex is false', () => {
        expect(resolveCVCErrorKey('cc.cvc.920', 'mc')).toBe('cc.cvc.920');
        expect(resolveCVCErrorKey('cc.cvc.921', 'mc')).toBe('cc.cvc.921');
    });

    it('should return the Amex-specific error key when isAmex is true', () => {
        expect(resolveCVCErrorKey('cc.cvc.920', 'amex')).toBe('cc.cvc.920.amex');
        expect(resolveCVCErrorKey('cc.cvc.921', 'amex')).toBe('cc.cvc.921.amex');
    });
});
