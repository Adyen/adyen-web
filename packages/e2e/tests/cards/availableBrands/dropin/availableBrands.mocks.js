import { RequestMock, RequestLogger } from 'testcafe';
import { BASE_URL } from '../../../pages';

const path = require('path');
require('dotenv').config({ path: path.resolve('../../', '.env') });

const MOCK_SESSION_ID = 'CS616D08FC28573F9C';
const MOCK_SESSION_DATA = 'Ab02b4c0!BQABAgChW9EQ6U';

const sessionsUrl = 'http://localhost:3024/sessions';
const setupUrl = `https://checkoutshopper-test.adyen.com/checkoutshopper/v1/sessions/${MOCK_SESSION_ID}/setup?clientKey=${process.env.CLIENT_KEY}`;
const paymentUrl = `https://checkoutshopper-test.adyen.com/checkoutshopper/v1/sessions/${MOCK_SESSION_ID}/payments?clientKey=${process.env.CLIENT_KEY}`;

const sessionsResponse = {
    amount: {
        currency: 'USD',
        value: 25900
    },
    countryCode: 'US',
    expiresAt: '2021-10-15T13:02:27+02:00',
    id: MOCK_SESSION_ID,
    merchantAccount: 'TestMerchantCheckout',
    reference: 'ABC123',
    returnUrl: 'http://localhost:3024/result',
    shopperLocale: 'en-US',
    shopperReference: 'newshoppert',
    sessionData: MOCK_SESSION_DATA
};

const setupResponse = {
    amount: {
        currency: 'USD',
        value: 25900
    },
    countryCode: 'US',
    expiresAt: '2021-10-15T13:02:27+02:00',
    id: MOCK_SESSION_ID,
    returnUrl: 'http://localhost:3024/result',
    shopperLocale: 'en-US',
    paymentMethods: {
        paymentMethods: [
            {
                brand: 'genericgiftcard',
                name: 'Generic GiftCard',
                type: 'giftcard'
            },
            {
                brands: ['visa', 'mc', 'amex', 'discover', 'cup', 'maestro', 'bijcard', 'dineXrs', 'jcb', 'synchrony_cbcc'],
                name: 'Credit Card',
                type: 'scheme'
            }
        ]
    },
    sessionData: MOCK_SESSION_DATA
};

const paymentResponse = {
    resultCode: 'Authorised',
    sessionData: MOCK_SESSION_DATA
};

const loggers = {
    setupLogger: RequestLogger({ url: setupUrl, method: 'post' }, { logRequestBody: true }),
    paymentLogger: RequestLogger({ url: paymentUrl, method: 'post' }, { logRequestBody: true })
};

const mock = RequestMock()
    .onRequestTo(request => request.url === sessionsUrl)
    .respond(sessionsResponse, 200, { 'Access-Control-Allow-Origin': BASE_URL })
    .onRequestTo(request => request.url === setupUrl && request.method === 'post')
    .respond(setupResponse, 200, { 'Access-Control-Allow-Origin': BASE_URL })
    .onRequestTo(request => request.url === paymentUrl && request.method === 'post')
    .respond(paymentResponse, 200, { 'Access-Control-Allow-Origin': BASE_URL });

export { mock, loggers, MOCK_SESSION_DATA };
