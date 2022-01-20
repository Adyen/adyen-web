import { RequestMock, RequestLogger } from 'testcafe';
import { BASE_URL } from '../pages';

const countriesDatasetUrl = 'https://checkoutshopper-test.adyen.com/checkoutshopper/datasets/countries/en-US.json';
const unitedStatesDatasetUrl = 'https://checkoutshopper-test.adyen.com/checkoutshopper/datasets/states/US/en-US.json';
const brazilDatasetUrl = 'https://checkoutshopper-test.adyen.com/checkoutshopper/datasets/states/BR/en-US.json';

const countriesDatasetResponse = [
    { id: 'BR', name: 'Brazil' },
    { id: 'US', name: 'United States' },
    { id: 'NL', name: 'Netherlands' }
];

const unitedStatesDatasetResponse = [
    { id: 'CA', name: 'California' },
    { id: 'FL', name: 'Florida' }
];

const brazilDatasetResponse = [
    { id: 'MG', name: 'Minas Gerais' },
    { id: 'SP', name: 'São Paulo' }
];

const mock = RequestMock()
    .onRequestTo(request => request.url === countriesDatasetUrl)
    .respond(countriesDatasetResponse, 200, { 'Access-Control-Allow-Origin': BASE_URL })
    .onRequestTo(request => request.url === unitedStatesDatasetUrl)
    .respond(unitedStatesDatasetResponse, 200, { 'Access-Control-Allow-Origin': BASE_URL })
    .onRequestTo(request => request.url === brazilDatasetUrl)
    .respond(brazilDatasetResponse, 200, { 'Access-Control-Allow-Origin': BASE_URL });

export { mock };
