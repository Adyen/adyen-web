import getCurrency from './getCurrency';
import { getSearchParameters } from '../utils';

const DEFAULT_LOCALE = 'en-US';
const DEFAULT_COUNTRY = 'US';

const urlParams = getSearchParameters(window.location.search);
const merchantAccount = urlParams.merchantAccount;
export const shopperLocale = urlParams.shopperLocale || DEFAULT_LOCALE;
export const countryCode = urlParams.countryCode || DEFAULT_COUNTRY;
export const currency = getCurrency(countryCode);
export const amountValue = urlParams.amount ?? 85900;
export const shopperReference = 'newshoppert';
export const amount = {
    currency,
    value: Number(amountValue)
};

export const useSession = urlParams.session !== 'manual';

export const returnUrl = 'http://localhost:3020/result';

export default {
    amount,
    countryCode,
    shopperLocale,
    channel: 'Web',
    shopperReference,
    ...(merchantAccount && { merchantAccount })
};
