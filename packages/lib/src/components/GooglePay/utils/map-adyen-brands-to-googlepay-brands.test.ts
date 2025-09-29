import { mapGooglePayBrands } from './map-adyen-brands-to-googlepay-brands';

describe('mapGooglePayBrands()', () => {
    it('should correctly map a list of known Adyen brand codes', () => {
        const adyenBrands = ['mc', 'visa', 'amex'];
        const expected = ['MASTERCARD', 'VISA', 'AMEX'];
        const result = mapGooglePayBrands(adyenBrands);

        expect(result).toEqual(expected);
    });

    it('should ignore any unknown or unsupported brand codes in the list', () => {
        const adyenBrands = ['mc', 'unsupported_brand', 'visa'];
        const expected = ['MASTERCARD', 'VISA'];
        const result = mapGooglePayBrands(adyenBrands);

        expect(result).toEqual(expected);
    });

    it('should return a unique list of brands even if the input contains duplicates', () => {
        const adyenBrands = ['mc', 'visa', 'mc'];
        const expected = ['MASTERCARD', 'VISA'];
        const result = mapGooglePayBrands(adyenBrands);

        expect(result.length).toBe(2);
        expect(result).toEqual(expected);
    });

    it('should return an empty array when given an empty array', () => {
        const adyenBrands: string[] = [];
        const result = mapGooglePayBrands(adyenBrands);

        expect(result).toEqual([]);
    });

    it('should return an empty array if all provided brands are unknown', () => {
        const adyenBrands = ['unknown1', 'unknown2'];
        const result = mapGooglePayBrands(adyenBrands);

        expect(result).toEqual([]);
    });

    it('should correctly map all supported Adyen brands', () => {
        const allAdyenBrands = ['mc', 'amex', 'visa', 'elodebit', 'elo', 'interac', 'discover', 'jcb', 'electron', 'maestro'];
        const allExpectedGooglePayBrands: google.payments.api.CardNetwork[] = [
            'MASTERCARD',
            'AMEX',
            'VISA',
            'ELO_DEBIT',
            'ELO',
            'INTERAC',
            'DISCOVER',
            'JCB',
            'ELECTRON',
            'MAESTRO'
        ];

        const result = mapGooglePayBrands(allAdyenBrands);

        expect(result.length).toBe(allExpectedGooglePayBrands.length);
        expect(result).toEqual(allExpectedGooglePayBrands);
    });
});
