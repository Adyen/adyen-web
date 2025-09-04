import { httpPost } from '../http';
import collectId, { FAILURE_MSG } from './collect-id';
import { ANALYTICS_PATH } from '../../Analytics/constants';

jest.mock('../http');

const mockedHttpPost = httpPost as jest.Mock;

const httpPromiseSuccessMock = jest.fn(() => Promise.resolve({ checkoutAttemptId: 'mockCheckoutAttemptId' }));
const httpPromiseFailMock = jest.fn(() => Promise.reject('Error'));

const BASE_CONFIGURATION = {
    analyticsContext: 'https://checkoutanalytics-test.adyen.com/checkoutanalytics/',
    locale: 'en-US',
    bundleType: 'umd',
    clientKey: 'xxxx-yyyy',
    amount: {
        value: 10000,
        currency: 'USD'
    },
    analyticsPath: ANALYTICS_PATH
};

let requestAttemptId;

beforeEach(() => {
    process.env.VERSION = 'x.x.x';
    requestAttemptId = collectId(BASE_CONFIGURATION);

    mockedHttpPost.mockReset();
    mockedHttpPost.mockImplementation(httpPromiseSuccessMock);
    httpPromiseSuccessMock.mockClear();
    httpPromiseFailMock.mockClear();
});

afterEach(() => {
    window.sessionStorage.clear();
});

test('should reject the promise in case the request fails', async () => {
    mockedHttpPost.mockImplementation(httpPromiseFailMock);

    await expect(requestAttemptId({})).rejects.toBeDefined();
    expect(httpPost).toHaveBeenCalledTimes(1);
});

test('should send expected data to http service', async () => {
    const customEvent = {
        flavor: 'components',
        containerWidth: 600,
        component: 'scheme'
    };

    await expect(requestAttemptId(customEvent)).resolves.toStrictEqual('mockCheckoutAttemptId');

    expect(httpPost).toHaveBeenCalledTimes(1);
    expect(httpPost).toHaveBeenCalledWith(
        {
            errorLevel: 'fatal',
            loadingContext: 'https://checkoutanalytics-test.adyen.com/checkoutanalytics/',
            path: `${ANALYTICS_PATH}?clientKey=xxxx-yyyy`,
            errorMessage: FAILURE_MSG
        },
        {
            version: 'x.x.x',
            channel: 'Web',
            platform: 'Web',
            locale: BASE_CONFIGURATION.locale,
            referrer: 'http://localhost/',
            screenWidth: 0,
            flavor: customEvent.flavor,
            containerWidth: customEvent.containerWidth,
            component: customEvent.component,
            buildType: 'umd'
        }
    );
});

test('should reuse the same if called multiple times', async () => {
    await expect(requestAttemptId({})).resolves.toStrictEqual('mockCheckoutAttemptId');
    expect(httpPost).toHaveBeenCalledTimes(1);

    await expect(requestAttemptId({})).resolves.toStrictEqual('mockCheckoutAttemptId');
    expect(httpPost).toHaveBeenCalledTimes(1);
});
