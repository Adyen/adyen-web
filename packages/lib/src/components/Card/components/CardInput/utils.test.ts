import { resolveCVCErrorKey, shouldShowClickToPaySignup, shouldShowInstallmentsComponent } from './utils';
import { CtpState } from '../../../internal/ClickToPay/services/ClickToPayService';

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
        expect(resolveCVCErrorKey('cc.cvc.920', false)).toBe('cc.cvc.920');
        expect(resolveCVCErrorKey('cc.cvc.921', false)).toBe('cc.cvc.921');
    });

    it('should return the Amex-specific error key when isAmex is true', () => {
        expect(resolveCVCErrorKey('cc.cvc.920', true)).toBe('cc.cvc.920.amex');
        expect(resolveCVCErrorKey('cc.cvc.921', true)).toBe('cc.cvc.921.amex');
    });

    it('should return the original error code unchanged when it has no Amex variant, regardless of brand', () => {
        expect(resolveCVCErrorKey('cc.num.902', true)).toBe('cc.num.902');
        expect(resolveCVCErrorKey('cc.num.902', false)).toBe('cc.num.902');
    });
});

describe('shouldShowClickToPaySignup', () => {
    const baseParams = {
        isClickToPaySignupAvailable: true,
        ctpState: CtpState.NotAvailable,
        selectedBrandValue: 'mc',
        binLookupBrand: 'mc'
    };

    it('should return false if the sign-up is not available', () => {
        expect(shouldShowClickToPaySignup({ ...baseParams, isClickToPaySignupAvailable: false })).toBe(false);
        expect(shouldShowClickToPaySignup({ ...baseParams, isClickToPaySignupAvailable: undefined })).toBe(false);
    });

    it.each([CtpState.Idle, CtpState.Loading, CtpState.ShopperIdentified, CtpState.OneTimePassword, CtpState.Ready, CtpState.Login])(
        'should return false if the Click to Pay state is %s',
        ctpState => {
            expect(shouldShowClickToPaySignup({ ...baseParams, ctpState })).toBe(false);
        }
    );

    it('should return true if the selected brand is Mastercard', () => {
        expect(shouldShowClickToPaySignup({ ...baseParams, binLookupBrand: '' })).toBe(true);
    });

    it('should return true if there is no selected brand and the BIN lookup brand is Mastercard', () => {
        expect(shouldShowClickToPaySignup({ ...baseParams, selectedBrandValue: '' })).toBe(true);
    });

    it('should prefer the selected brand over the BIN lookup brand', () => {
        expect(shouldShowClickToPaySignup({ ...baseParams, selectedBrandValue: 'bcmc', binLookupBrand: 'mc' })).toBe(false);
    });

    it('should return false if the active brand is not Mastercard', () => {
        expect(shouldShowClickToPaySignup({ ...baseParams, selectedBrandValue: 'visa', binLookupBrand: 'visa' })).toBe(false);
    });

    it('should return false if no brand has been confirmed', () => {
        expect(shouldShowClickToPaySignup({ ...baseParams, selectedBrandValue: '', binLookupBrand: '' })).toBe(false);
    });
});
