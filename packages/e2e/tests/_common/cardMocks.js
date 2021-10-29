import { ClientFunction, RequestMock } from 'testcafe';
import { BASE_URL } from '../pages';

import path from 'path';
require('dotenv').config({ path: path.resolve('../../', '.env') });

export const binLookupUrl = `https://checkoutshopper-test.adyen.com/checkoutshopper/v2/bin/binLookup?token=${process.env.CLIENT_KEY}`;

/**
 * Functionality for mocking a /binLookup API response via testcafe's fixture.requestHooks()
 *
 * @param requestURL
 * @param mockedResponse
 * @returns {RequestMock}
 */
export const getBinLookupMock = (requestURL, mockedResponse) => {
    return RequestMock()
        .onRequestTo(request => {
            return request.url === requestURL && request.method === 'post';
        })
        .respond(
            (req, res) => {
                const body = JSON.parse(req.body);
                mockedResponse.requestId = body.requestId;
                res.setBody(mockedResponse);
            },
            200,
            {
                'Access-Control-Allow-Origin': BASE_URL
            }
        );
};

// For the tests as a whole - throw an error if SDK binLookup mocking is turned on
export const checkSDKMocking = ClientFunction(() => {
    if (window.mockBinCount > 0) {
        throw new Error('SDK bin mocking is turned on - this will affect/break the tests - so turn it off in triggerBinLookup.ts');
    }
});

// For individual test suites (perhaps being run in isolation) - provide a way to ensure SDK bin mocking is turned off
export const turnOffSDKMocking = ClientFunction(() => {
    window.mockBinCount = 0;
});
