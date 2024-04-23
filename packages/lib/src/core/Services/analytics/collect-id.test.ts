import { httpPost } from '../http';
import collectId, { FAILURE_MSG } from './collect-id';
import { ANALYTICS_PATH } from '../../Analytics/constants';
import { CollectIdEvent } from './types';

jest.mock('../http');

const mockedHttpPost = httpPost as jest.Mock;

const httpPromiseSuccessMock = jest.fn(() => Promise.resolve({ checkoutAttemptId: 'mockCheckoutAttemptId' }));

const httpPromiseFailMock = jest.fn(() => Promise.reject(' url incorrect'));

const BASE_CONFIGURATION = {
    analyticsContext: 'https://checkoutanalytics-test.adyen.com/checkoutanalytics/',
    locale: 'en-US',
    amount: {
        value: 10000,
        currency: 'USD'
    },
    analyticsPath: ANALYTICS_PATH
};

beforeEach(() => {
    process.env.VERSION = 'x.x.x';

    mockedHttpPost.mockReset();
    mockedHttpPost.mockImplementation(httpPromiseSuccessMock);
    httpPromiseSuccessMock.mockClear();
});

test('Should lead to a rejected promise since no clientKey is provided', () => {
    const log = collectId(BASE_CONFIGURATION);
    log({} as CollectIdEvent)
        .then()
        .catch(e => {
            expect(e).toEqual('no-client-key');
        });
});

test('Should fail since path is incorrect', () => {
    mockedHttpPost.mockReset();
    mockedHttpPost.mockImplementation(httpPromiseFailMock);
    httpPromiseFailMock.mockClear();

    const configuration = {
        ...BASE_CONFIGURATION,
        clientKey: 'xxxx-yyyy',
        analyticsPath: 'v99/analytics'
    };

    const log = collectId(configuration);
    log({} as CollectIdEvent)
        .then(val => {
            expect(val).toEqual(FAILURE_MSG);
        })
        .catch(() => {});

    expect(httpPost).toHaveBeenCalledTimes(1);
});

test('Should send expected data to http service', () => {
    const configuration = {
        ...BASE_CONFIGURATION,
        clientKey: 'xxxx-yyyy'
    };

    const customEvent = {
        flavor: 'components',
        containerWidth: 600,
        component: 'scheme'
    };

    const log = collectId(configuration);

    log(customEvent).then(val => {
        expect(val).toEqual('mockCheckoutAttemptId');
    });

    expect(httpPost).toHaveBeenCalledTimes(1);
    expect(httpPost).toHaveBeenCalledWith(
        {
            errorLevel: 'fatal',
            loadingContext: 'https://checkoutanalytics-test.adyen.com/checkoutanalytics/',
            path: `${ANALYTICS_PATH}?clientKey=xxxx-yyyy`
        },
        {
            // amount: configuration.amount,// TODO will be supported in the future
            channel: 'Web',
            platform: 'Web',
            locale: configuration.locale,
            referrer: 'http://localhost/',
            screenWidth: 0,
            version: 'x.x.x',
            flavor: customEvent.flavor,
            containerWidth: customEvent.containerWidth,
            component: customEvent.component,
            buildType: 'compiled'
        }
    );

    // A second attempt should return the previous promise and not lead to a new http call
    const log2 = log(customEvent);
    log2.then(val => {
        expect(val).toEqual('mockCheckoutAttemptId');
    });
    expect(httpPost).toHaveBeenCalledTimes(1);
});
