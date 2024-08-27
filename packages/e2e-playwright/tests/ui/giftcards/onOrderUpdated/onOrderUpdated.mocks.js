import { RequestMock, RequestLogger } from 'testcafe';
import { BASE_URL } from '@adyen/adyen-web-e2e/tests/pages';

const path = require('path');
require('dotenv').config({ path: path.resolve('../../', '.env') });

const MOCK_SESSION_ID = 'CS616D08FC28573F9C';
const MOCK_SESSION_DATA = 'Ab02b4c0!BQABAgChW9EQ6U';

const sessionsUrl = 'http://localhost:3024/sessions';
const setupUrl = `https://checkoutshopper-test.adyen.com/checkoutshopper/v1/sessions/${MOCK_SESSION_ID}/setup?clientKey=${process.env.CLIENT_KEY}`;
const balanceUrl = `https://checkoutshopper-test.adyen.com/checkoutshopper/v1/sessions/${MOCK_SESSION_ID}/paymentMethodBalance?clientKey=${process.env.CLIENT_KEY}`;
const ordersUrl = `https://checkoutshopper-test.adyen.com/checkoutshopper/v1/sessions/${MOCK_SESSION_ID}/orders?clientKey=${process.env.CLIENT_KEY}`;
const paymentsUrl = `https://checkoutshopper-test.adyen.com/checkoutshopper/v1/sessions/${MOCK_SESSION_ID}/payments?clientKey=${process.env.CLIENT_KEY}`;

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
        storedPaymentMethods: [
            {
                brand: 'visa',
                expiryMonth: '03',
                expiryYear: '2030',
                holderName: 'Checkout Shopper PlaceHolder',
                id: '8415611088427239',
                lastFour: '1111',
                name: 'VISA',
                supportedShopperInteractions: ['Ecommerce', 'ContAuth'],
                type: 'scheme'
            }
        ]
    },
    sessionData: MOCK_SESSION_DATA
};

const balanceResponse = {
    balance: {
        currency: 'USD',
        value: 6000
    },
    sessionData: MOCK_SESSION_DATA
};

const ordersResponse = {
    orderData: '',
    sessionData: MOCK_SESSION_DATA
};

const paymentResponse = {
    order: {
        amount: {
            currency: 'USD',
            value: 25900
        },
        reference: 'ABC123',
        remainingAmount: {
            currency: 'USD',
            value: 19900
        }
    },
    resultCode: 'Authorised',
    sessionData: MOCK_SESSION_DATA
};

const noCallbackPaymentResponse = {
    resultCode: 'Authorised',
    sessionData: MOCK_SESSION_DATA
};

const loggers = {
    setupLogger: RequestLogger({ url: setupUrl, method: 'post' }, { logRequestBody: true }),
    balanceLogger: RequestLogger({ url: balanceUrl, method: 'post' }, { logRequestBody: true }),
    ordersLogger: RequestLogger({ url: ordersUrl, method: 'post' }, { logRequestBody: true }),
    paymentLogger: RequestLogger({ url: paymentsUrl, method: 'post' }, { logRequestBody: true })
};

const mock = RequestMock()
    .onRequestTo(request => request.url === sessionsUrl)
    .respond(sessionsResponse, 200, { 'Access-Control-Allow-Origin': BASE_URL })
    .onRequestTo(request => request.url === setupUrl && request.method === 'post')
    .respond(setupResponse, 200, { 'Access-Control-Allow-Origin': BASE_URL })
    .onRequestTo(request => request.url === balanceUrl && request.method === 'post')
    .respond(balanceResponse, 200, { 'Access-Control-Allow-Origin': BASE_URL })
    .onRequestTo(request => request.url === ordersUrl && request.method === 'post')
    .respond(ordersResponse, 200, { 'Access-Control-Allow-Origin': BASE_URL })
    .onRequestTo(request => request.url === paymentsUrl && request.method === 'post')
    .respond(paymentResponse, 200, { 'Access-Control-Allow-Origin': BASE_URL });

const noCallbackMock = RequestMock()
    .onRequestTo(request => request.url === sessionsUrl)
    .respond(sessionsResponse, 500, { 'Access-Control-Allow-Origin': BASE_URL })
    .onRequestTo(request => request.url === setupUrl && request.method === 'post')
    .respond(setupResponse, 200, { 'Access-Control-Allow-Origin': BASE_URL })
    .onRequestTo(request => request.url === balanceUrl && request.method === 'post')
    .respond(balanceResponse, 200, { 'Access-Control-Allow-Origin': BASE_URL })
    .onRequestTo(request => request.url === ordersUrl && request.method === 'post')
    .respond(ordersResponse, 200, { 'Access-Control-Allow-Origin': BASE_URL })
    .onRequestTo(request => request.url === paymentsUrl && request.method === 'post')
    .respond(noCallbackPaymentResponse, 200, { 'Access-Control-Allow-Origin': BASE_URL });

export { mock, noCallbackMock, loggers, MOCK_SESSION_DATA };
