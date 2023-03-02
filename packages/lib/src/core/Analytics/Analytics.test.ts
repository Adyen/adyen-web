import Analytics from './Analytics';
import collectId from '../Services/analytics/collect-id';
import postTelemetry from '../Services/analytics/post-telemetry';
import { PaymentAmountExtended } from '../../types';

jest.mock('../Services/analytics/collect-id');
jest.mock('../Services/analytics/post-telemetry');

const mockedCollectId = collectId as jest.Mock;
const mockedPostTelemetry = postTelemetry as jest.Mock;

let amount: PaymentAmountExtended;

describe('Analytics', () => {
    const collectIdPromiseMock = jest.fn(() => Promise.resolve('123456'));
    const logTelemetryPromiseMock = jest.fn(request => Promise.resolve(request));

    beforeEach(() => {
        mockedCollectId.mockReset();
        mockedCollectId.mockImplementation(() => collectIdPromiseMock);
        collectIdPromiseMock.mockClear();
        mockedPostTelemetry.mockReset();
        mockedPostTelemetry.mockImplementation(() => logTelemetryPromiseMock);
        logTelemetryPromiseMock.mockClear();

        amount = { value: 50000, currency: 'USD' };
    });

    test('Creates an Analytics module with defaultProps', () => {
        const analytics = new Analytics({ analytics: {}, loadingContext: '', locale: '', clientKey: '', amount });
        expect(analytics.props.enabled).toBe(true);
        expect(analytics.props.telemetry).toBe(true);
        expect(collectIdPromiseMock).toHaveLength(0);
    });

    test('Calls the collectId endpoint by default (telemetry enabled)', () => {
        const analytics = new Analytics({ analytics: {}, loadingContext: '', locale: '', clientKey: '', amount });
        expect(collectIdPromiseMock).not.toHaveBeenCalled();
        analytics.send({});
        expect(collectIdPromiseMock).toHaveBeenCalled();
    });

    test('Will not call the collectId endpoint if telemetry is disabled', () => {
        const analytics = new Analytics({ analytics: { telemetry: false }, loadingContext: '', locale: '', clientKey: '', amount });
        expect(collectIdPromiseMock).not.toHaveBeenCalled();
        analytics.send({});
        expect(collectIdPromiseMock).not.toHaveBeenCalled();
    });

    test('Sends an event', async () => {
        const event = {
            eventData: 'test'
        };
        const analytics = new Analytics({ analytics: {}, loadingContext: '', locale: '', clientKey: '', amount });
        analytics.send(event);

        expect(collectIdPromiseMock).toHaveBeenCalled();
        await Promise.resolve(); // wait for the next tick
        expect(logTelemetryPromiseMock).toHaveBeenCalledWith({ ...event, checkoutAttemptId: '123456' });
    });

    test('Adds the fields in the payload', async () => {
        const payload = {
            payloadData: 'test'
        };
        const event = {
            eventData: 'test'
        };
        const analytics = new Analytics({ analytics: { payload }, loadingContext: '', locale: '', clientKey: '', amount });

        analytics.send(event);

        expect(collectIdPromiseMock).toHaveBeenCalled();
        await Promise.resolve(); // wait for the next tick
        expect(logTelemetryPromiseMock).toHaveBeenCalledWith({ ...payload, ...event, checkoutAttemptId: '123456' });
    });

    test('Should not fire any calls if analytics is disabled', () => {
        const analytics = new Analytics({ analytics: { enabled: false }, loadingContext: '', locale: '', clientKey: '', amount });

        analytics.send({});
        expect(collectIdPromiseMock).not.toHaveBeenCalled();
        expect(logTelemetryPromiseMock).not.toHaveBeenCalled();
    });
});
