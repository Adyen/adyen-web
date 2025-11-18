import { getLocalisedAmount, getDivider } from './amount-util';

describe('getDivider', () => {
    test('should return the divider for a currency', () => {
        expect(getDivider('USD')).toBe(100);
        expect(getDivider('JPY')).toBe(1);
        expect(getDivider('BHD')).toBe(1000);
        expect(getDivider('MRO')).toBe(10);
    });
});

describe('getLocalisedAmount', () => {
    let spyOnToLocaleString;

    beforeAll(() => {
        spyOnToLocaleString = jest.spyOn(Number.prototype, 'toLocaleString');
    });

    afterEach(() => {
        spyOnToLocaleString.mockClear();
    });

    afterAll(() => {
        spyOnToLocaleString.mockRestore();
    });

    test('should return a formatted EUR amount', () => {
        getLocalisedAmount(1000, 'nl-NL', 'EUR');
        expect(spyOnToLocaleString).toHaveBeenCalledWith('nl-NL', { currency: 'EUR', currencyDisplay: 'symbol', style: 'currency' });
    });

    test('should return a formatted USD amount', () => {
        getLocalisedAmount(1000, 'en-US', 'USD');
        expect(spyOnToLocaleString).toHaveBeenCalledWith('en-US', { currency: 'USD', currencyDisplay: 'symbol', style: 'currency' });
    });

    test('should return an amount if no locale is passed', () => {
        expect(getLocalisedAmount(1000, 'undefined', 'undefined')).toBe('1000');
    });
});
