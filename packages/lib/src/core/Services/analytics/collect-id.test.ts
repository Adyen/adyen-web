import { httpPost } from '../http';
import collectId from './collect-id';

jest.mock('../http', () => ({
    httpPost: jest.fn(
        () =>
            new Promise(resolve => {
                resolve({ id: 'mockCheckoutAttemptId' });
            })
    )
}));

beforeEach(() => {
    process.env.VERSION = 'x.x.x';
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

    log(customEvent).then(val => {
        expect(val).toEqual('mockCheckoutAttemptId');
    });

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
