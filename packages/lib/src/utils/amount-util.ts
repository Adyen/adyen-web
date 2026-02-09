import { PaymentAmount } from '../types';
import CURRENCY_DECIMALS from './constants/currency-decimals';
import { currencyMinorUnitsConfig } from './constants/currency-minor-units';

/**
 * @internal
 * @param currencyCode -
 * Get divider amount
 */
export const getDivider = (currencyCode: string): number => {
    const divider = CURRENCY_DECIMALS[currencyCode as keyof typeof CURRENCY_DECIMALS];
    return divider || 100;
};

/**
 * @internal
 */
export const getDecimalAmount = (amount: number | string, currencyCode: string): number => {
    const divider = getDivider(currencyCode);
    return parseInt(String(amount), 10) / divider;
};

/**
 * @internal
 */
export const getLocalisedAmount = (amount: number, locale: string, currencyCode: string, options = {}): string => {
    const stringAmount = amount.toString(); // Changing amount to string to avoid 0-value from returning false

    const decimalAmount = getDecimalAmount(stringAmount, currencyCode);
    const formattedLocale = locale.replace('_', '-');

    const modifiedOptions = currencyMinorUnitsConfig[currencyCode] ? { ...options, ...currencyMinorUnitsConfig[currencyCode] } : options;

    const localeOptions: Intl.NumberFormatOptions = {
        style: 'currency',
        currency: currencyCode,
        currencyDisplay: 'symbol',
        ...modifiedOptions
    };

    try {
        return decimalAmount.toLocaleString(formattedLocale, localeOptions);
    } catch (e) {
        return stringAmount;
    }
};

/**
 * Validates a payment amount object.
 *
 * @param amount - The payment amount object to validate
 * @returns True if the amount has a valid numeric value, non-empty currency string,
 *          and optionally a valid currencyDisplay string
 */
export const isAmountValid = (amount: PaymentAmount): boolean => {
    if (!amount || typeof amount !== 'object') {
        return false;
    }

    const hasValidValue = typeof amount.value === 'number' && !Number.isNaN(amount.value);
    const hasValidCurrency = typeof amount.currency === 'string' && amount.currency.length > 0;
    const hasValidCurrencyDisplay = amount.currencyDisplay === undefined || typeof amount.currencyDisplay === 'string';

    return hasValidValue && hasValidCurrency && hasValidCurrencyDisplay;
};
