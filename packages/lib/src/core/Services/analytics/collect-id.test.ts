import { httpPost } from '../http';
import collectId from './collect-id';

jest.mock('../http', () => ({
    // ...jest.requireActual('../http'),
    httpPost: jest.fn(() => new Promise(() => {}))
}));

// jest.mock('../http');
// const mockedHttp = httpPost as jest.Mock;
// const httpPromiseMock = jest.fn(() => new Promise((resolve, reject) => {}));

beforeEach(() => {
    process.env.VERSION = 'x.x.x';
    // mockedHttp.mockImplementation(() => httpPromiseMock);
});

test('should send proper data to http service', () => {
    const configuration = {
        analyticsContext: 'https://checkoutanalytics-test.adyen.com/checkoutanalytics/',
        locale: 'en-US',
        clientKey: 'xxxx-yyyy',
        amount: {
            value: 10000,
            currency: 'USD'
        }
    };

    const customEvent = {
        flavor: 'components',
        containerWidth: 600,
        component: 'scheme'
    };

    const log = collectId(configuration);

    log(customEvent);

    expect(httpPost).toHaveBeenCalledTimes(1);
    expect(httpPost).toHaveBeenCalledWith(
        {
            errorLevel: 'silent',
            loadingContext: 'https://checkoutanalytics-test.adyen.com/checkoutanalytics/',
            path: 'v2/analytics?clientKey=xxxx-yyyy'
        },
        {
            // amount: configuration.amount,// TODO will be supported in the future
            channel: 'Web',
            locale: configuration.locale,
            referrer: 'http://localhost/',
            screenWidth: 0,
            version: 'x.x.x',
            flavor: customEvent.flavor,
            containerWidth: customEvent.containerWidth,
            component: customEvent.component
        }
    );
});
