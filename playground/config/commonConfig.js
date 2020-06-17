import getCurrency from './currencies';
import { getSearchParameters } from '../utils';

const DEFAULT_LOCALE = 'en-US';
const DEFAULT_COUNTRY = 'US';

const urlParams = getSearchParameters(window.location.search);
export const shopperLocale = urlParams.shopperLocale || DEFAULT_LOCALE;
export const countryCode = urlParams.countryCode || DEFAULT_COUNTRY;
export const currency = getCurrency(countryCode);
export const amount = {
    currency,
    value: 25900
};

export default {
    amount,
    countryCode,
    shopperLocale,
    channel: 'Web',
    shopperReference: 'newshoppert'
    // merchantAccount: 'TestMerchant' // override merchantAccount
};
