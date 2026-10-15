import { resolvePlaceholders } from './utils';

describe('resolvePlaceholders', () => {
    const topLevel = { cardNumber: '2207 8500 1234 5678 0000 1', securityCode: '1234' };

    test('should return the top-level placeholders when the brand has no configuration', () => {
        expect(resolvePlaceholders('givex', { svs: { placeholders: { cardNumber: '1' } } }, topLevel)).toEqual(topLevel);
    });

    test('should return the brand placeholders when there are no top-level placeholders', () => {
        const brandsConfiguration = { illicado: { placeholders: { cardNumber: '0000 0000 0000 0000 000', securityCode: '123' } } };

        expect(resolvePlaceholders('illicado', brandsConfiguration)).toEqual({ cardNumber: '0000 0000 0000 0000 000', securityCode: '123' });
    });

    test('should merge per key, with brand placeholders taking priority over top-level ones', () => {
        const brandsConfiguration = { illicado: { placeholders: { cardNumber: '0000 0000 0000 0000 000' } } };

        expect(resolvePlaceholders('illicado', brandsConfiguration, topLevel)).toEqual({
            cardNumber: '0000 0000 0000 0000 000',
            securityCode: '1234'
        });
    });

    test('should let an empty string in the brand placeholders blank out a top-level placeholder', () => {
        const brandsConfiguration = { illicado: { placeholders: { securityCode: '' } } };

        expect(resolvePlaceholders('illicado', brandsConfiguration, topLevel)).toEqual({
            cardNumber: topLevel.cardNumber,
            securityCode: ''
        });
    });

    test('should not modify the top-level placeholders object', () => {
        const original = { ...topLevel };

        resolvePlaceholders('illicado', { illicado: { placeholders: { cardNumber: 'x' } } }, topLevel);

        expect(topLevel).toEqual(original);
    });

    test('should ignore brand placeholders when the brand is undefined', () => {
        expect(resolvePlaceholders(undefined, { undefined: { placeholders: { cardNumber: 'x' } } }, topLevel)).toEqual(topLevel);
    });

    test('should return an empty object when nothing is configured', () => {
        expect(resolvePlaceholders('givex', undefined, undefined)).toEqual({});
        expect(resolvePlaceholders('givex', {}, undefined)).toEqual({});
    });
});
