import getCurrency from './getCurrency';
import { getSearchParameters } from '../utils';

const DEFAULT_LOCALE = 'nl-NL';
const DEFAULT_COUNTRY = 'NL';

const urlParams = getSearchParameters(window.location.search);
const merchantAccount = urlParams.merchantAccount;
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
    shopperReference: 'newshoppert',
    ...(merchantAccount && { merchantAccount })
};
