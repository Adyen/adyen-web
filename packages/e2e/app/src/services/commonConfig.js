import getCurrency from '../utils/getCurrency';
import { getSearchParameters } from '../utils/utils';

const DEFAULT_LOCALE = 'en-US';
const DEFAULT_COUNTRY = 'US';

const urlParams = getSearchParameters(window.location.search);
export const shopperLocale = DEFAULT_LOCALE;
export const countryCode = urlParams.countryCode || DEFAULT_COUNTRY;
export const currency = getCurrency(countryCode);
export const amountValue = urlParams.amount || 25900;
export const amount = {
    currency,
    value: Number(amountValue)
};

export const returnUrl = 'http://localhost:3024/result';
export const shopperReference = 'newshoppert';

export default {
    amount,
    countryCode,
    shopperLocale,
    channel: 'Web',
    shopperReference: 'newshoppert'
};
