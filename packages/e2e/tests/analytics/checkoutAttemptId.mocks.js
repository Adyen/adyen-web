import { RequestLogger, RequestMock } from 'testcafe';
import { BASE_URL } from '../pages';

const paymentUrl = `http://localhost:3024/payments`;

const paymentResponse = {
    resultCode: 'Authorised'
};

const paymentLogger = RequestLogger({ url: paymentUrl, method: 'post' }, { logRequestBody: true });

const mock = RequestMock()
    .onRequestTo(request => request.url === paymentUrl && request.method === 'post')
    .respond(paymentResponse, 200, { 'Access-Control-Allow-Origin': BASE_URL });

export { paymentLogger, mock };
