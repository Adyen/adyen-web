import { SESSION_DATA_MOCK } from '../../tests/utils/constants';
import { protocol } from '../../environment-variables';

const sessionsMockData = {
    amount: { currency: 'EUR', value: 2000 },
    expiresAt: '2023-10-10T11:48:26+02:00',
    countryCode: 'FR',
    id: 'CSFF69355B6EAD2F68',
    merchantAccount: 'TestMerchantCheckout',
    returnUrl: `${protocol}://localhost:3020/`,
    shopperLocale: 'en-US',
    sessionData: SESSION_DATA_MOCK
};
export { sessionsMockData };
