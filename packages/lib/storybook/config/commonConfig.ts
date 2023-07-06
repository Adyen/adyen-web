const protocol = process.env.IS_HTTPS === 'true' ? 'https' : 'http';
export const DEFAULT_SHOPPER_LOCALE = 'en-US';
export const DEFAULT_COUNTRY_CODE = 'US';
export const DEFAULT_AMOUNT_VALUE = 25900;
export const SHOPPER_REFERENCE = 'newshoppert';
export const RETURN_URL = `${protocol}://localhost:3020/?path=/story/helpers-redirectresult--redirect-result`;
