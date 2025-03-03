import { mapBrands } from './map-adyen-brands-to-applepay-brands';

describe('mapBrands()', () => {
    test('should rename certain brands based on the Apple Pay SDK brands support', () => {
        const backofficeBrands = ['mc', 'elodebit', 'eftpos_australia', 'cartebancaire'];
        const applePayBrands = mapBrands(backofficeBrands);
        expect(applePayBrands).toStrictEqual(['masterCard', 'elo', 'eftpos', 'cartesBancaires']);
    });

    test('should not add unsupported brand to the Apple Pay brands array', () => {
        const backofficeBrands = ['visa', 'amex', 'new_brand'];
        const applePayBrands = mapBrands(backofficeBrands);
        expect(applePayBrands).toStrictEqual(['visa', 'amex']);
    });
});
