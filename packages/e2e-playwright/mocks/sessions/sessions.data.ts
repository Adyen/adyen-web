import { SESSION_DATA_MOCK } from '../../tests/utils/constants';

const sessionsMockData = {
    amount: { currency: 'EUR', value: 2000 },
    expiresAt: '2023-10-10T11:48:26+02:00',
    id: 'CSFF69355B6EAD2F68',
    merchantAccount: 'TestMerchantCheckout',
    returnUrl: 'http://localhost:3024/',
    shopperLocale: 'en-US',
    sessionData: SESSION_DATA_MOCK
};
export { sessionsMockData };
