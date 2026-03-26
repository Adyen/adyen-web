import { mock, MockProxy } from 'jest-mock-extended';
import DonationCampaignService, { DEFAULT_DONATION_AUTO_START_DELAY_MS } from './DonationCampaignService';
import type { ICore } from '../../core/types';
import type { DonationCampaign, DonationCampaignOptions } from './types';
import type { CheckoutSessionDonationCampaignsResponse, CheckoutSessionDonationsResponse } from '../../core/CheckoutSession/types';
import CheckoutSession from '../../core/CheckoutSession';
import type { IAnalytics } from '../../core/Analytics/Analytics';

const createMockCore = (): MockProxy<ICore> => {
    const core = mock<ICore>();
    const analytics = mock<IAnalytics>();
    const session = mock<CheckoutSession>();

    // @ts-ignore - ignore missing props
    core.modules = {
        analytics
    };
    core.session = session;
    core.options = {
        donation: {
            autoStart: true,
            onSuccess: jest.fn(),
            onError: jest.fn(),
            delay: 0
        }
    };

    return core;
};

const createMockDonationCampaign = (overrides?: Partial<DonationCampaign>): DonationCampaign => ({
    id: 'campaign-123',
    campaignName: 'Test Campaign',
    donation: {
        type: 'roundup',
        currency: 'EUR',
        maxRoundupAmount: 100
    },
    bannerUrl: '/banner.png',
    logoUrl: '/logo.png',
    nonprofitDescription: 'Test charity description',
    nonprofitName: 'Test Charity',
    nonprofitUrl: 'https://example.org',
    ...overrides
});

const defaultDonationCampaignProps: DonationCampaignOptions = {
    rootNode: document.createElement('div'),
    commercialTxAmount: 1000
};

describe('DonationCampaignService', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        // Reset the static instance count before each test
        // @ts-ignore - accessing private static for testing
        DonationCampaignService.instanceCount = 0;
    });

    afterEach(() => {
        jest.useRealTimers();
        jest.clearAllMocks();
    });

    describe('constructor', () => {
        test('should create an instance with valid props', () => {
            const core = createMockCore();
            const service = new DonationCampaignService(core, defaultDonationCampaignProps);

            expect(service).toBeInstanceOf(DonationCampaignService);
        });

        test('should throw error when creating multiple instances without autoStart false', () => {
            const core = createMockCore();
            new DonationCampaignService(core, defaultDonationCampaignProps);

            expect(() => {
                new DonationCampaignService(core, defaultDonationCampaignProps);
            }).toThrow(
                'DonationCampaignService:: You need to set donation.autoStart to false if you wish to display the Donation component in a different container.'
            );
        });
    });

    describe('initialise', () => {
        test('should wait for default delay before calling donationCampaigns endpoint', async () => {
            const core = createMockCore();
            core.options = {
                donation: {
                    autoStart: true,
                    delay: DEFAULT_DONATION_AUTO_START_DELAY_MS
                }
            };

            const mockResponse: CheckoutSessionDonationCampaignsResponse = {
                sessionData: 'test-session-data',
                donationCampaigns: [createMockDonationCampaign()]
            };
            (core.session.fetchDonationCampaigns as jest.Mock).mockResolvedValue(mockResponse);

            const service = new DonationCampaignService(core, defaultDonationCampaignProps);
            const initPromise = service.initialise();

            expect(core.session.fetchDonationCampaigns).not.toHaveBeenCalled();

            jest.advanceTimersByTime(DEFAULT_DONATION_AUTO_START_DELAY_MS);
            await Promise.resolve();

            await initPromise;

            expect(core.session.fetchDonationCampaigns).toHaveBeenCalled();
        });

        test('should wait for custom delay before calling donationCampaigns endpoint', async () => {
            const core = createMockCore();
            core.options = {
                donation: {
                    autoStart: true,
                    delay: 1000
                }
            };

            const mockResponse: CheckoutSessionDonationCampaignsResponse = {
                sessionData: 'test-session-data',
                donationCampaigns: [createMockDonationCampaign()]
            };
            (core.session.fetchDonationCampaigns as jest.Mock).mockResolvedValue(mockResponse);

            const service = new DonationCampaignService(core, defaultDonationCampaignProps);
            const initPromise = service.initialise();

            expect(core.session.fetchDonationCampaigns).not.toHaveBeenCalled();

            jest.advanceTimersByTime(1000);
            await Promise.resolve();

            await initPromise;

            expect(core.session.fetchDonationCampaigns).toHaveBeenCalled();
        });

        test('should return DonationConfiguration (roundup donation type) when campaign is available', async () => {
            const core = createMockCore();
            const mockCampaign = createMockDonationCampaign();
            const mockResponse: CheckoutSessionDonationCampaignsResponse = {
                sessionData: 'test-session-data',
                donationCampaigns: [mockCampaign]
            };
            (core.session.fetchDonationCampaigns as jest.Mock).mockResolvedValue(mockResponse);

            const service = new DonationCampaignService(core, defaultDonationCampaignProps);
            const resultPromise = service.initialise();

            jest.advanceTimersByTime(0);
            const result = await resultPromise;

            expect(result).toBeDefined();

            // Expect the additional properties that DonationCampaignService adds, to be set
            expect(result).toHaveProperty('onCancel');
            expect(result).toHaveProperty('onDonate');
            expect(result).toHaveProperty('commercialTxAmount', defaultDonationCampaignProps.commercialTxAmount);
        });

        test('should return null when no campaigns are available', async () => {
            const core = createMockCore();
            const mockResponse: CheckoutSessionDonationCampaignsResponse = {
                sessionData: 'test-session-data',
                donationCampaigns: []
            };
            (core.session.fetchDonationCampaigns as jest.Mock).mockResolvedValue(mockResponse);

            const service = new DonationCampaignService(core, defaultDonationCampaignProps);
            const resultPromise = service.initialise();

            jest.advanceTimersByTime(0);
            const result = await resultPromise;

            expect(result).toBeNull();
        });

        test('should return null when donationCampaigns response is undefined', async () => {
            const core = createMockCore();
            (core.session.fetchDonationCampaigns as jest.Mock).mockResolvedValue({
                sessionData: 'test-session-data',
                donationCampaigns: undefined
            });

            const service = new DonationCampaignService(core, defaultDonationCampaignProps);
            const resultPromise = service.initialise();

            jest.advanceTimersByTime(0);
            const result = await resultPromise;

            expect(result).toBeNull();
        });

        test('should send analytics event when calling donationCampaigns', async () => {
            const core = createMockCore();
            const mockResponse: CheckoutSessionDonationCampaignsResponse = {
                sessionData: 'test-session-data',
                donationCampaigns: [createMockDonationCampaign()]
            };
            (core.session.fetchDonationCampaigns as jest.Mock).mockResolvedValue(mockResponse);

            const service = new DonationCampaignService(core, defaultDonationCampaignProps);
            const resultPromise = service.initialise();

            jest.advanceTimersByTime(0);
            await resultPromise;

            expect(core.modules.analytics.sendAnalytics).toHaveBeenCalled();
        });

        test('should throw error when donationCampaigns call fails', async () => {
            const core = createMockCore();
            const error = new Error('Network error');
            (core.session.fetchDonationCampaigns as jest.Mock).mockRejectedValue(error);

            const service = new DonationCampaignService(core, defaultDonationCampaignProps);
            const resultPromise = service.initialise();

            jest.advanceTimersByTime(0);

            await expect(resultPromise).rejects.toThrow('Network error');
        });
    });

    describe('roundup donation type', () => {
        test('should throw error for roundup donation without commercialTxAmount', async () => {
            const core = createMockCore();
            const mockCampaign = createMockDonationCampaign({
                donation: {
                    type: 'roundup',
                    currency: 'EUR',
                    maxRoundupAmount: 100
                }
            });
            const mockResponse: CheckoutSessionDonationCampaignsResponse = {
                sessionData: 'test-session-data',
                donationCampaigns: [mockCampaign]
            };
            (core.session.fetchDonationCampaigns as jest.Mock).mockResolvedValue(mockResponse);

            // @ts-ignore - forcing commercialTxAmount to be undefined
            const donationCampaignPropsWithoutAmount: DonationCampaignOptions = {
                rootNode: document.createElement('div')
                // commercialTxAmount: 0
            };

            const service = new DonationCampaignService(core, donationCampaignPropsWithoutAmount);
            const resultPromise = service.initialise();

            jest.advanceTimersByTime(0);

            await expect(resultPromise).rejects.toThrow('The donation type is "roundup" and the commercialTxAmount is not set.');
        });

        test('should throw error for roundup donation when commercialTxAmount is set to 0', async () => {
            const core = createMockCore();
            const mockCampaign = createMockDonationCampaign({
                donation: {
                    type: 'roundup',
                    currency: 'EUR',
                    maxRoundupAmount: 100
                }
            });
            const mockResponse: CheckoutSessionDonationCampaignsResponse = {
                sessionData: 'test-session-data',
                donationCampaigns: [mockCampaign]
            };
            (core.session.fetchDonationCampaigns as jest.Mock).mockResolvedValue(mockResponse);

            const donationCampaignPropsWithoutAmount: DonationCampaignOptions = {
                rootNode: document.createElement('div'),
                commercialTxAmount: 0
            };

            const service = new DonationCampaignService(core, donationCampaignPropsWithoutAmount);
            const resultPromise = service.initialise();

            jest.advanceTimersByTime(0);

            await expect(resultPromise).rejects.toThrow('The donation type is "roundup" and the commercialTxAmount is not set.');
        });
    });

    describe('onCancel callback', () => {
        test('should call onDonationCompleted with false when onCancel is triggered', async () => {
            const core = createMockCore();
            const onSuccess = jest.fn();
            core.options = {
                donation: {
                    autoStart: true,
                    onSuccess,
                    delay: 0
                }
            };

            const mockCampaign = createMockDonationCampaign();
            const mockResponse: CheckoutSessionDonationCampaignsResponse = {
                sessionData: 'test-session-data',
                donationCampaigns: [mockCampaign]
            };
            (core.session.fetchDonationCampaigns as jest.Mock).mockResolvedValue(mockResponse);

            const service = new DonationCampaignService(core, defaultDonationCampaignProps);
            const resultPromise = service.initialise();

            jest.advanceTimersByTime(0);
            const result = await resultPromise;

            result?.onCancel({ data: { amount: { currency: 'EUR', value: 100 } } });

            expect(onSuccess).toHaveBeenCalledWith({ didDonate: false });
        });
    });

    describe('fixedAmounts donation type', () => {
        test('should return DonationConfiguration (fixedAmounts donation type)  when campaign is available', async () => {
            const core = createMockCore();
            const mockCampaign = createMockDonationCampaign({
                donation: {
                    type: 'fixedAmounts',
                    currency: 'EUR',
                    values: [100, 200, 500]
                }
            });
            const mockResponse: CheckoutSessionDonationCampaignsResponse = {
                sessionData: 'test-session-data',
                donationCampaigns: [mockCampaign]
            };
            (core.session.fetchDonationCampaigns as jest.Mock).mockResolvedValue(mockResponse);

            const service = new DonationCampaignService(core, defaultDonationCampaignProps);
            const resultPromise = service.initialise();

            jest.advanceTimersByTime(0);
            const result = await resultPromise;

            expect(result).toBeDefined();
            expect(result).toHaveProperty('onCancel');
            expect(result).toHaveProperty('onDonate');
            expect(result?.donation).toEqual({
                type: 'fixedAmounts',
                currency: 'EUR',
                values: [100, 200, 500]
            });
        });

        test('should call donations endpoint with fixedAmounts donation type', async () => {
            const core = createMockCore();
            const mockDonationsResponse: CheckoutSessionDonationsResponse = {
                resultCode: 'Authorised',
                sessionData: 'test-session-data'
            };
            (core.session.makeDonation as jest.Mock).mockResolvedValue(mockDonationsResponse);

            const mockCampaign = createMockDonationCampaign({
                donation: {
                    type: 'fixedAmounts',
                    currency: 'EUR',
                    values: [100, 200, 500]
                }
            });
            const mockResponse: CheckoutSessionDonationCampaignsResponse = {
                sessionData: 'test-session-data',
                donationCampaigns: [mockCampaign]
            };
            (core.session.fetchDonationCampaigns as jest.Mock).mockResolvedValue(mockResponse);

            const service = new DonationCampaignService(core, defaultDonationCampaignProps);
            const resultPromise = service.initialise();

            jest.advanceTimersByTime(0);
            const result = await resultPromise;

            const mockComponent = {
                setStatus: jest.fn()
            };

            // @ts-ignore - using mock component
            result?.onDonate({ data: { amount: { currency: 'EUR', value: 200 } } }, mockComponent);

            await Promise.resolve();

            expect(core.session.makeDonation).toHaveBeenCalledWith({
                amount: { currency: 'EUR', value: 200 },
                donationCampaignId: 'campaign-123',
                donationType: 'fixedAmounts'
            });
        });

        test('should NOT throw error for fixedAmounts donation without commercialTxAmount', async () => {
            const core = createMockCore();
            const mockCampaign = createMockDonationCampaign({
                donation: {
                    type: 'fixedAmounts',
                    currency: 'EUR',
                    values: [100, 200, 500]
                }
            });
            const mockResponse: CheckoutSessionDonationCampaignsResponse = {
                sessionData: 'test-session-data',
                donationCampaigns: [mockCampaign]
            };
            (core.session.fetchDonationCampaigns as jest.Mock).mockResolvedValue(mockResponse);

            // @ts-ignore - forcing commercialTxAmount to be undefined
            const donationCampaignPropsWithoutAmount: DonationCampaignOptions = {
                rootNode: document.createElement('div')
            };

            const service = new DonationCampaignService(core, donationCampaignPropsWithoutAmount);
            const resultPromise = service.initialise();

            jest.advanceTimersByTime(0);
            const result = await resultPromise;

            // Should not throw - fixedAmounts doesn't require commercialTxAmount
            expect(result).toBeDefined();
            expect(result?.donation).toEqual({
                type: 'fixedAmounts',
                currency: 'EUR',
                values: [100, 200, 500]
            });
        });
    });

    describe('onDonate callback', () => {
        test('should call donations endpoint when onDonate is triggered', async () => {
            const core = createMockCore();
            const mockDonationsResponse: CheckoutSessionDonationsResponse = {
                resultCode: 'Authorised',
                sessionData: 'test-session-data'
            };
            (core.session.makeDonation as jest.Mock).mockResolvedValue(mockDonationsResponse);

            const mockCampaign = createMockDonationCampaign();
            const mockResponse: CheckoutSessionDonationCampaignsResponse = {
                sessionData: 'test-session-data',
                donationCampaigns: [mockCampaign]
            };
            (core.session.fetchDonationCampaigns as jest.Mock).mockResolvedValue(mockResponse);

            const service = new DonationCampaignService(core, defaultDonationCampaignProps);
            const resultPromise = service.initialise();

            jest.advanceTimersByTime(0);
            const result = await resultPromise;

            const mockComponent = {
                setStatus: jest.fn()
            };

            // @ts-ignore - using mock component
            result?.onDonate({ data: { amount: { currency: 'EUR', value: 100 } } }, mockComponent);

            await Promise.resolve();

            expect(core.session.makeDonation).toHaveBeenCalledWith({
                amount: { currency: 'EUR', value: 100 },
                donationCampaignId: 'campaign-123',
                donationType: 'roundup'
            });
        });

        test('should set status to success and call onDonationCompleted when donation is authorised', async () => {
            const core = createMockCore();
            const onSuccess = jest.fn();
            core.options = {
                donation: {
                    autoStart: true,
                    onSuccess,
                    delay: 0
                }
            };

            const mockDonationsResponse: CheckoutSessionDonationsResponse = {
                resultCode: 'Authorised',
                sessionData: 'test-session-data'
            };
            (core.session.makeDonation as jest.Mock).mockResolvedValue(mockDonationsResponse);

            const mockCampaign = createMockDonationCampaign();
            const mockResponse: CheckoutSessionDonationCampaignsResponse = {
                sessionData: 'test-session-data',
                donationCampaigns: [mockCampaign]
            };
            (core.session.fetchDonationCampaigns as jest.Mock).mockResolvedValue(mockResponse);

            const service = new DonationCampaignService(core, defaultDonationCampaignProps);
            const resultPromise = service.initialise();

            jest.advanceTimersByTime(0);
            const result = await resultPromise;

            const mockComponent = {
                setStatus: jest.fn()
            };

            // @ts-ignore - using mock component
            result?.onDonate({ data: { amount: { currency: 'EUR', value: 100 } } }, mockComponent);

            await Promise.resolve();
            await Promise.resolve();

            expect(mockComponent.setStatus).toHaveBeenCalledWith('success');
            expect(onSuccess).toHaveBeenCalledWith({ didDonate: true });
        });

        test('should set status to error and call onDonationFailed when donation is refused', async () => {
            const core = createMockCore();
            const onError = jest.fn();
            core.options = {
                donation: {
                    autoStart: true,
                    onError,
                    delay: 0
                }
            };

            const mockDonationsResponse: CheckoutSessionDonationsResponse = {
                resultCode: 'Refused',
                sessionData: 'test-session-data'
            };
            (core.session.makeDonation as jest.Mock).mockResolvedValue(mockDonationsResponse);

            const mockCampaign = createMockDonationCampaign();
            const mockResponse: CheckoutSessionDonationCampaignsResponse = {
                sessionData: 'test-session-data',
                donationCampaigns: [mockCampaign]
            };
            (core.session.fetchDonationCampaigns as jest.Mock).mockResolvedValue(mockResponse);

            const service = new DonationCampaignService(core, defaultDonationCampaignProps);
            const resultPromise = service.initialise();

            jest.advanceTimersByTime(0);
            const result = await resultPromise;

            const mockComponent = {
                setStatus: jest.fn()
            };

            // @ts-ignore - using mock component
            result?.onDonate({ data: { amount: { currency: 'EUR', value: 100 } } }, mockComponent);

            await Promise.resolve();
            await Promise.resolve();

            expect(mockComponent.setStatus).toHaveBeenCalledWith('error');
            expect(onError).toHaveBeenCalledWith('Refused');
        });

        test('should set status to error and call onDonationFailed when donations call fails', async () => {
            // Use real timers for this test since we need proper promise rejection handling
            jest.useRealTimers();

            const core = createMockCore();
            const onError = jest.fn();
            core.options = {
                donation: {
                    autoStart: true,
                    onError,
                    delay: 0
                }
            };

            const error = new Error('Donation failed');
            (core.session.makeDonation as jest.Mock).mockRejectedValue(error);

            const mockCampaign = createMockDonationCampaign();
            const mockResponse: CheckoutSessionDonationCampaignsResponse = {
                sessionData: 'test-session-data',
                donationCampaigns: [mockCampaign]
            };
            (core.session.fetchDonationCampaigns as jest.Mock).mockResolvedValue(mockResponse);

            const service = new DonationCampaignService(core, defaultDonationCampaignProps);
            const result = await service.initialise();

            const mockComponent = {
                setStatus: jest.fn()
            };

            // @ts-ignore - using mock component
            result?.onDonate({ data: { amount: { currency: 'EUR', value: 100 } } }, mockComponent);

            // Wait for promise rejection to propagate
            await new Promise(resolve => setTimeout(resolve, 10));

            expect(mockComponent.setStatus).toHaveBeenCalledWith('error');
            expect(onError).toHaveBeenCalledWith(error);
        });
    });

    describe('static type', () => {
        test('should have correct static type', () => {
            expect(DonationCampaignService.type).toBe('donationCampaignService');
        });
    });
});
