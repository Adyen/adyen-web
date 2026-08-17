import { getLocalisedPercentage, getLocalisedPercentageFromBasisPoints } from './percentage-util';

describe('getLocalisedPercentage', () => {
    test('should render a fraction as a percentage', () => {
        expect(getLocalisedPercentage(0.155, 'en-US')).toBe('15.5%');
        expect(getLocalisedPercentage(0.075, 'en-US')).toBe('7.5%');
    });

    test('should keep two fraction digits at most', () => {
        expect(getLocalisedPercentage(0.1599, 'en-US')).toBe('15.99%');
        expect(getLocalisedPercentage(0.123456, 'en-US')).toBe('12.35%');
    });

    test('should not pad a whole percentage with fraction digits', () => {
        expect(getLocalisedPercentage(0.12, 'en-US')).toBe('12%');
        expect(getLocalisedPercentage(0, 'en-US')).toBe('0%');
    });

    test('should take the decimal separator and the symbol spacing from the locale', () => {
        // de-DE separates the value from the symbol with a non-breaking space
        expect(getLocalisedPercentage(0.155, 'de-DE')).toBe('15,5\u00a0%');
        expect(getLocalisedPercentage(0.155, 'pt-BR')).toBe('15,5%');
        expect(getLocalisedPercentage(0.155, 'en-IN')).toBe('15.5%');
    });

    test('should accept overrides for the number format', () => {
        expect(getLocalisedPercentage(0.1599, 'en-US', { maximumFractionDigits: 0 })).toBe('16%');
        expect(getLocalisedPercentage(0.12, 'en-US', { minimumFractionDigits: 2 })).toBe('12.00%');
    });

    test('should fall back to the raw rate when the locale tag is malformed', () => {
        // Intl throws a RangeError on a tag it cannot parse, such as one with an underscore
        expect(getLocalisedPercentage(0.155, 'en_US')).toBe('0.155');
    });
});

describe('getLocalisedPercentageFromBasisPoints', () => {
    test('should convert basis points into a localised percentage', () => {
        expect(getLocalisedPercentageFromBasisPoints(1599, 'en-US')).toBe('15.99%');
        expect(getLocalisedPercentageFromBasisPoints(1550, 'en-US')).toBe('15.5%');
        expect(getLocalisedPercentageFromBasisPoints(750, 'en-IN')).toBe('7.5%');
    });

    test('should render a rate of zero without fraction digits', () => {
        expect(getLocalisedPercentageFromBasisPoints(0, 'en-US')).toBe('0%');
    });

    test('should pass format options through', () => {
        expect(getLocalisedPercentageFromBasisPoints(1599, 'en-US', { maximumFractionDigits: 0 })).toBe('16%');
    });
});
