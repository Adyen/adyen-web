import Analytics from './Analytics';
import collectId from '../Services/analytics/collect-id';
import postTelemetry from '../Services/analytics/post-telemetry';

jest.mock('../Services/analytics/collect-id');
jest.mock('../Services/analytics/post-telemetry');

const mockedCollectId = <jest.Mock>collectId;
const mockedPostTelemetry = <jest.Mock>postTelemetry;

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
    });

    test('Creates an Analytics module with defaultProps', () => {
        const analytics = new Analytics({ analytics: {}, loadingContext: '', locale: '', clientKey: '' });
        expect(analytics.props.enabled).toBe(true);
        expect(analytics.props.telemetry).toBe(true);
        expect(analytics.props.conversion).toBe(false);
        expect(collectIdPromiseMock).toHaveLength(0);
    });

    test('Calls the collectId endpoint if conversion is enabled after the first telemetry call', () => {
        const analytics = new Analytics({ analytics: { conversion: true }, loadingContext: '', locale: '', clientKey: '' });
        expect(collectIdPromiseMock).not.toHaveBeenCalled();
        analytics.send({});
        expect(collectIdPromiseMock).toHaveBeenCalled();
    });

    test('Will not call the collectId endpoint if conversion is disabled', () => {
        const analytics = new Analytics({ analytics: { conversion: false }, loadingContext: '', locale: '', clientKey: '' });
        expect(collectIdPromiseMock).not.toHaveBeenCalled();
        analytics.send({});
        expect(collectIdPromiseMock).not.toHaveBeenCalled();
    });

    test('Sends an event', () => {
        const event = {
            eventData: 'test'
        };
        const analytics = new Analytics({ analytics: { conversion: false }, loadingContext: '', locale: '', clientKey: '' });
        analytics.send(event);
        expect(logTelemetryPromiseMock).toHaveBeenCalledWith({ ...event, conversionId: null });
    });

    test('Adds the fields in the payload', () => {
        const payload = {
            payloadData: 'test'
        };
        const event = {
            eventData: 'test'
        };
        const analytics = new Analytics({ analytics: { conversion: false, payload }, loadingContext: '', locale: '', clientKey: '' });
        analytics.send(event);
        expect(logTelemetryPromiseMock).toHaveBeenCalledWith({ ...payload, ...event, conversionId: null });
    });
});
