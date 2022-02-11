import { RequestMock, RequestLogger } from 'testcafe';
import { BASE_URL } from '../../pages';

// const path = require('path');
// require('dotenv').config({ path: path.resolve('../../', '.env') });

const paymentUrl = `http://localhost:3024/payments`;

const paymentResponse = {
    resultCode: 'Authorised'
};

const loggers = {
    paymentLogger: RequestLogger({ url: paymentUrl, method: 'post' }, { logRequestBody: true })
};

const mock = RequestMock()
    .onRequestTo(request => request.url === paymentUrl && request.method === 'post')
    .respond(paymentResponse, 200, { 'Access-Control-Allow-Origin': BASE_URL });

export { mock, loggers };
