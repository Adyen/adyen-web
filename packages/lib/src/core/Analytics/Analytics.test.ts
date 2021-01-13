import { default as Analytics } from './Analytics';
import { default as collectId } from '../Services/collect-id';

jest.mock('../Services/collect-id');

const mockedCollectId = <jest.Mock>collectId;

describe('Analytics', () => {
    beforeEach(() => {
        mockedCollectId.mockReset();
    });

    test('Creates an Analytics module with defaultProps', () => {
        const analytics = new Analytics({ analytics: {}, loadingContext: '', locale: '', originKey: '', clientKey: '' });
        expect(analytics.props.enabled).toBe(true);
        expect(analytics.props.telemetry).toBe(true);
        expect(analytics.props.conversion).toBe(false);
        expect(mockedCollectId.mock.calls).toHaveLength(0);
    });

    test('Calls the collectId endpoint if conversion is enabled', () => {
        mockedCollectId.mockResolvedValueOnce({ name: 'test' });
        new Analytics({ analytics: { conversion: true }, loadingContext: '', locale: '', originKey: '', clientKey: '' });
        expect(collectId).toHaveBeenCalled();
    });

    test('Will not call the collectId endpoint if conversion is disabled', () => {
        new Analytics({ analytics: { conversion: false }, loadingContext: '', locale: '', originKey: '', clientKey: '' });
        expect(collectId).not.toHaveBeenCalled();
    });
});
