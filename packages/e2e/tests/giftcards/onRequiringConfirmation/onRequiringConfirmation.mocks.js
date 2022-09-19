import { RequestMock, RequestLogger } from 'testcafe';
import { BASE_URL } from '../../pages';

import { mock, loggers } from '../onOrderCreated/onOrderCreated.mocks';

const path = require('path');
require('dotenv').config({ path: path.resolve('../../', '.env') });

const MOCK_SESSION_ID = 'CS616D08FC28573F9C';
const MOCK_SESSION_DATA = 'Ab02b4c0!BQABAgChW9EQ6U';

const balanceUrl = `https://checkoutshopper-test.adyen.com/checkoutshopper/v1/sessions/${MOCK_SESSION_ID}/paymentMethodBalance?clientKey=${process.env.CLIENT_KEY}`;

const balanceResponse = {
    balance: {
        currency: 'USD',
        value: 1000000
    },
    sessionData: MOCK_SESSION_DATA
};

const balanceMock = RequestMock()
    .onRequestTo(request => request.url === balanceUrl && request.method === 'post')
    .respond(balanceResponse, 200, {
        'Access-Control-Allow-Origin': BASE_URL
    });

export { mock, balanceMock, loggers, MOCK_SESSION_DATA };
