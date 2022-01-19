import { RequestMock, RequestLogger } from 'testcafe';
import { BASE_URL } from '../pages';

// const path = require('path');
// require('dotenv').config({ path: path.resolve('../../', '.env') });
//
// const MOCK_SESSION_ID = 'CS616D08FC28573F9C';
// const MOCK_SESSION_DATA = 'Ab02b4c0!BQABAgChW9EQ6U';
//
// const sessionsUrl = 'http://localhost:3024/sessions';
// const setupUrl = `https://checkoutshopper-test.adyen.com/checkoutshopper/v1/sessions/${MOCK_SESSION_ID}/setup?clientKey=${process.env.CLIENT_KEY}`;
// const paymentUrl = `https://checkoutshopper-test.adyen.com/checkoutshopper/v1/sessions/${MOCK_SESSION_ID}/payments?clientKey=${process.env.CLIENT_KEY}`;

const countriesDatasetUrl = 'https://checkoutshopper-test.adyen.com/checkoutshopper/datasets/countries/en-US.json';
const unitedStatesDatasetUrl = 'https://checkoutshopper-test.adyen.com/checkoutshopper/datasets/states/US/en-US.json';
const brazilDatasetUrl = 'https://checkoutshopper-test.adyen.com/checkoutshopper/datasets/states/BR/en-US.json';

const countriesDatasetResponse = [
    { id: 'BR', name: 'Brazil' },
    { id: 'US', name: 'United States' }
];

const unitedStatesDatasetResponse = [
    { id: 'CA', name: 'California' },
    { id: 'FL', name: 'Florida' }
];

const brazilDatasetResponse = [
    { id: 'MG', name: 'Minas Gerais' },
    { id: 'SP', name: 'São Paulo' }
];

// const loggers = {
//     setupLogger: RequestLogger({ url: setupUrl, method: 'post' }, { logRequestBody: true }),
//     paymentLogger: RequestLogger({ url: paymentUrl, method: 'post' }, { logRequestBody: true })
// };

const mock = RequestMock()
    .onRequestTo(request => request.url === countriesDatasetUrl)
    .respond(countriesDatasetResponse, 200, { 'Access-Control-Allow-Origin': BASE_URL })
    .onRequestTo(request => request.url === unitedStatesDatasetUrl)
    .respond(unitedStatesDatasetResponse, 200, { 'Access-Control-Allow-Origin': BASE_URL })
    .onRequestTo(request => request.url === brazilDatasetUrl)
    .respond(brazilDatasetResponse, 200, { 'Access-Control-Allow-Origin': BASE_URL });

export { mock };
