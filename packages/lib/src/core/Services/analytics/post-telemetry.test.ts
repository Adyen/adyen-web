import { httpPost } from '../http';
import logTelemetry from './post-telemetry';

jest.mock('../http', () => ({
    ...jest.requireActual('../http'),
    httpPost: jest.fn()
}));

beforeEach(() => {
    process.env.VERSION = 'x.x.x';
});

test('should send proper data to http service', () => {
    const configuration = {
        loadingContext: 'https://checkoutshopper-test.adyen.com/checkoutshopper/',
        locale: 'en-US',
        clientKey: 'xxxx-yyyy',
        amount: {
            value: 10000,
            currency: 'USD'
        }
    };

    const customEvent = {
        eventType: 'mouse-click'
    };

    const log = logTelemetry(configuration);

    log(customEvent);

    expect(httpPost).toHaveBeenCalledTimes(1);
    expect(httpPost).toHaveBeenCalledWith(
        {
            errorLevel: 'silent',
            loadingContext: 'https://checkoutshopper-test.adyen.com/checkoutshopper/',
            path: 'v2/analytics/log?clientKey=xxxx-yyyy'
        },
        {
            amount: {
                currency: 'USD',
                value: 10000
            },
            channel: 'Web',
            eventType: 'mouse-click',
            flavor: 'components',
            locale: 'en-US',
            referrer: 'http://localhost/',
            screenWidth: 0,
            userAgent: 'Mozilla/5.0 (linux) AppleWebKit/537.36 (KHTML, like Gecko) jsdom/20.0.3',
            version: 'x.x.x'
        }
    );
});
