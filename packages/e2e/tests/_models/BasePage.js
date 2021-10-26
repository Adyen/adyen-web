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

    /**
     * Centralised functionality for mocking an API response via testcafe's fixture.requestHooks()
     *
     * @param requestURL
     * @param mockedResponse
     * @param processResFn
     * @returns {RequestMock}
     */
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

    /**
     * Client function that accesses properties on the window object
     */
    getFromWindow = ClientFunction(path => {
        const splitPath = path.split('.');
        const reducer = (xs, x) => (xs && xs[x] !== undefined ? xs[x] : undefined);

        return splitPath.reduce(reducer, window);
    });

    /**
     * Hack to force testcafe to fire expected blur events as (securedFields) switch focus
     */
    setForceClick = ClientFunction(val => {
        window.testCafeForceClick = val;
    });

    // For the tests as a whole - throw an error if SDK binLookup mocking is turned on
    checkSDKMocking = ClientFunction(() => {
        if (window.mockBinCount > 0) {
            throw new Error('SDK bin mocking is turned on - this will affect/break the tests - so turn it off in triggerBinLookup.ts');
        }
    });

    // For individual test suites (perhaps being run in isolation) - provide a way to ensure SDK bin mocking is turned off
    turnOffSDKMocking = ClientFunction(() => {
        window.mockBinCount = 0;
    });
}
