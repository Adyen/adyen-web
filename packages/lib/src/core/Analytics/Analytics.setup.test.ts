import Analytics from './Analytics';
import collectId from '../Services/analytics/collect-id';

jest.mock('../Services/analytics/collect-id');

const mockedCollectId = collectId as jest.Mock;

describe('Analytics setup call', () => {
    const mockCollectIdPromise: jest.Mock = jest.fn();

    beforeEach(() => {
        mockCollectIdPromise.mockResolvedValue(null);
        mockedCollectId.mockImplementation(() => mockCollectIdPromise);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should send "initial" value for the level field', async () => {
        const analytics = Analytics({
            amount: undefined,
            bundleType: '',
            clientKey: undefined,
            loadingContext: undefined,
            locale: undefined,
            analytics: {
                enabled: false
            }
        });

        await analytics.setUp({ component: '', containerWidth: 0, flavor: '' });
        expect(mockCollectIdPromise).toHaveBeenCalledWith(expect.objectContaining({ level: 'initial' }));
    });

    it('should send "all" value for the level field', async () => {
        await Analytics({
            amount: undefined,
            bundleType: '',
            clientKey: undefined,
            loadingContext: undefined,
            locale: undefined
        }).setUp({ component: '', containerWidth: 0, flavor: '' });

        expect(mockCollectIdPromise).toHaveBeenCalledWith(expect.objectContaining({ level: 'all' }));
    });
});
