import getCurrency from '../utils/getCurrency';

const DEFAULT_LOCALE = 'en-US';
const DEFAULT_COUNTRY = 'US';

export const shopperLocale = DEFAULT_LOCALE;
export const countryCode = DEFAULT_COUNTRY;
export const currency = getCurrency(countryCode);
export const amountValue = 25900;
export const amount = {
    currency,
    value: Number(amountValue)
};

export default {
    amount,
    countryCode,
    shopperLocale,
    channel: 'Web',
    shopperReference: 'newshoppert'
};
