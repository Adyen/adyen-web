import path from 'path';
require('dotenv').config({ path: path.resolve('../../', '.env') });

import { BASE_URL } from '../pages';
import { ClientFunction, RequestMock } from 'testcafe';

export default class BasePage {
    constructor(url) {
        this.pageUrl = `${BASE_URL}/${url}`;
        this.binLookupUrl = `https://checkoutshopper-test.adyen.com/checkoutshopper/v2/bin/binLookup?token=${process.env.CLIENT_KEY}`;
    }

    /**
     * Default fn
     * - suitable for /binLookup scenario: this requires the response to contain the requestId prop
     * (generated internally & sent in the original request) and which is then propagated back in the response
     *
     * @param reqBody
     * @param mockedResponse
     * @returns mockedResponse object enhanced with the properties set in this function
     */
    processMockResponse(reqBody, mockedResponse) {
        mockedResponse.requestId = reqBody.requestId;
        return mockedResponse;
    }

    getMock(requestURL, mockedResponse, processResFn = null) {
        return RequestMock()
            .onRequestTo(request => {
                return request.url === requestURL && request.method === 'post';
            })
            .respond(
                (req, res) => {
                    const body = JSON.parse(req.body);
                    const processedRes = !processResFn ? this.processMockResponse(body, mockedResponse) : processResFn(body, mockedResponse);
                    res.setBody(processedRes);
                },
                200,
                {
                    'Access-Control-Allow-Origin': BASE_URL
                }
            );
    }

    getFromWindow = ClientFunction(path => {
        const splitPath = path.split('.');
        const reducer = (xs, x) => (xs && xs[x] !== undefined ? xs[x] : undefined);

        return splitPath.reduce(reducer, window);
    });
}
