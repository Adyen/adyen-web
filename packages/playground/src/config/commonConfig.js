import getCurrency from './getCurrency';
import { getSearchParameters } from '../utils';

const DEFAULT_LOCALE = 'en-US';
const DEFAULT_COUNTRY = 'GB';

const urlParams = getSearchParameters(window.location.search);
const merchantAccount = urlParams.merchantAccount;
export const shopperLocale = urlParams.shopperLocale || DEFAULT_LOCALE;
export const countryCode = urlParams.countryCode || DEFAULT_COUNTRY;
export const currency = getCurrency(countryCode);
export const amountValue = urlParams.amount ?? 25900;
export const amount = {
    currency,
    value: Number(amountValue)
};

export default {
    amount,
    countryCode,
    shopperLocale,
    channel: 'Web',
    shopperReference: 'newshoppert',
    ...(merchantAccount && { merchantAccount })
};
