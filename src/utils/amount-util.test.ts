import { isValidCurrencyCode, getCurrencyCode, getLocalisedAmount, getLocalisedPercentage, getDivider } from './amount-util';

describe('isValidCurrencyCode', () => {
    test('should return false for empty values', () => {
        expect(isValidCurrencyCode('')).toBe(false);
        expect(isValidCurrencyCode(null)).toBe(false);
        expect(isValidCurrencyCode('0')).toBe(false);
    });

    // In the past this currency code was an exception, test that everything still works
    test('should return true for BYN', () => {
        expect(isValidCurrencyCode('BYN')).toBe(true);
    });

    test('should return true for existing keys', () => {
        expect(isValidCurrencyCode('USD')).toBe(true);
    });

    test('should return false for non existing keys', () => {
        expect(isValidCurrencyCode('FAKE')).toBe(false);
    });
});

describe('getDivider', () => {
    test('should return the divider for a currency', () => {
        expect(getDivider('USD')).toBe(100);
        expect(getDivider('JPY')).toBe(1);
        expect(getDivider('BHD')).toBe(1000);
        expect(getDivider('MRO')).toBe(10);
    });
});

describe('getCurrencyCode', () => {
    test('should return false for empty values', () => {
        expect(getCurrencyCode('')).toBe(false);
        expect(getCurrencyCode(null)).toBe(false);
        expect(getCurrencyCode('0')).toBe(false);
    });

    test('should return a currency symbol for existing keys', () => {
        expect(getCurrencyCode('USD')).toBe('$');
        expect(getCurrencyCode('BYN')).toBe('Br');
    });

    test('should return a false for non existing keys', () => {
        expect(getCurrencyCode('FAKE')).toBe(false);
        expect(getCurrencyCode('123')).toBe(false);
        expect(getCurrencyCode(undefined)).toBe(false);
        expect(getCurrencyCode('true')).toBe(false);
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

describe('getLocalisedPercentage', () => {
    test('should return a percentage formatted string', () => {
        expect(getLocalisedPercentage(1000, 'en-US')).toBe('10%');
        expect(getLocalisedPercentage(100, 'en-US')).toBe('1%');
        expect(getLocalisedPercentage(10, 'en-US')).toBe('0.1%');
        expect(getLocalisedPercentage(1, 'en-US')).toBe('0.01%');
        expect(getLocalisedPercentage(1234, 'en-US')).toBe('12.34%');
        expect(getLocalisedPercentage(-2500, 'en-US')).toBe('-25%');
    });
});
