import Analytics from './Analytics';
import collectId from '../Services/analytics/collect-id';

jest.mock('../Services/analytics/collect-id');

const mockedCollectId = <jest.Mock>collectId;

describe('Analytics', () => {
    const collectIdPromiseMock = jest.fn(() => Promise.resolve('123456'));

    beforeEach(() => {
        mockedCollectId.mockReset();
        mockedCollectId.mockImplementation(() => collectIdPromiseMock);
        collectIdPromiseMock.mockClear();
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
});
