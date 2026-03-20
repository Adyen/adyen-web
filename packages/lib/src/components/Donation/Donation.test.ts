import { render, screen, waitFor } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import DonationElement from './Donation';
import DonationCampaignService from './DonationCampaignService';
import { setupCoreMock } from '../../../config/testMocks/setup-core-mock';
import type { DonationCampaignOptions } from './types';

const core = setupCoreMock();
const coreProp = { i18n: global.i18n, loadingContext: 'test', modules: { resources: global.resources } };
const shared = {
    commercialTxAmount: 1000,
    termsAndConditionsUrl: 'https://www.adyen.com',
    bannerUrl: '/banner.png',
    logoUrl: '/logo.png',
    nonprofitDescription: 'Lorem ipsum...',
    nonprofitName: 'Test Charity',
    causeName: 'Earthquake Turkey & Syria',
    nonprofitUrl: 'https://example.org'
};
const fixedAmountsDonationProp = {
    ...coreProp,
    ...shared,
    donation: { type: 'fixedAmounts', currency: 'EUR', values: [50, 100] }
};
const roundupDonationProp = {
    ...coreProp,
    ...shared,
    donation: { type: 'roundup', currency: 'EUR', maxRoundupAmount: 100 }
};

describe('Donation element', () => {
    describe('Roundup donation', () => {
        test('should call onDonate with the donation data', async () => {
            const user = userEvent.setup();
            const onDonate = jest.fn();

            // @ts-ignore not all callbacks are needed
            const donationElement = new DonationElement(core, {
                ...roundupDonationProp,
                onDonate
            });
            render(donationElement.render());
            const donateBtn = await screen.findByRole('button', { name: 'Donate €1.00' });
            await user.click(donateBtn);
            expect(onDonate).toBeCalledWith({ data: { amount: { currency: 'EUR', value: 100 } }, isValid: true }, expect.any(Object));
        });

        test('should call onCancel with the donation data', async () => {
            const user = userEvent.setup();
            const onCancel = jest.fn();
            // @ts-ignore not all callbacks are needed
            const donationElement = new DonationElement(core, {
                ...roundupDonationProp,
                onCancel
            });
            render(donationElement.render());
            const cancelBtn = await screen.findByRole('button', { name: /not now/i });
            await user.click(cancelBtn);
            expect(onCancel).toBeCalledWith({ data: { amount: { currency: 'EUR', value: 100 } }, isValid: true });
        });
    });

    describe('Fixed amounts donation', () => {
        test('should call onDonate with the donation data', async () => {
            const user = userEvent.setup();
            const onDonate = jest.fn();
            const {
                donation: { currency, values: expectedValues }
            } = fixedAmountsDonationProp;
            // @ts-ignore not all callbacks are needed
            const donationElement = new DonationElement(core, {
                ...fixedAmountsDonationProp,
                onDonate
            });
            render(donationElement.render());
            const firstAmount = (await screen.findAllByRole('radio'))[0];
            await user.click(firstAmount);
            await waitFor(() => {
                expect(donationElement.isValid).toBe(true);
            });
            const donateBtn = await screen.findByRole('button', { name: 'Donate' });
            await user.click(donateBtn);
            expect(onDonate).toHaveBeenCalledWith({ data: { amount: { currency, value: expectedValues[0] } }, isValid: true }, expect.any(Object));
        });

        test('should call onCancel with the donation data', async () => {
            const user = userEvent.setup();
            const {
                donation: { currency }
            } = fixedAmountsDonationProp;
            const onCancel = jest.fn();
            // @ts-ignore not all callbacks are needed
            const donationElement = new DonationElement(core, {
                ...fixedAmountsDonationProp,
                onCancel
            });
            render(donationElement.render());
            const cancelBtn = await screen.findByRole('button', { name: /not now/i });
            await user.click(cancelBtn);
            expect(onCancel).toBeCalledWith({ data: { amount: { currency, value: null } }, isValid: false });
        });
    });

    describe('Service mode (sessions flow)', () => {
        const serviceModeMockCampaign = {
            id: 'campaign-123',
            campaignName: 'Test Campaign',
            donation: { type: 'fixedAmounts', currency: 'EUR', values: [100, 200] },
            bannerUrl: '/banner.png',
            logoUrl: '/logo.png',
            nonprofitDescription: 'Test charity',
            nonprofitName: 'Test Charity',
            nonprofitUrl: 'https://example.org'
        };

        const serviceModeProps: DonationCampaignOptions = {
            rootNode: '#donation-container',
            commercialTxAmount: 1000
        };

        beforeEach(() => {
            // Reset the static instance count before each test
            // @ts-ignore - accessing private static for testing
            DonationCampaignService.instanceCount = 0;
        });

        test('should enter service mode when props contain rootNode and session exists', () => {
            const coreWithSession = setupCoreMock({ mockSessions: true });
            // @ts-ignore - accessing private property for testing
            coreWithSession.options = { donation: { delay: 0 } };

            const initialiseSpy = jest.spyOn(DonationCampaignService.prototype, 'initialise').mockResolvedValue(null);

            // @ts-ignore - not all props needed
            const donationElement = new DonationElement(coreWithSession, serviceModeProps);

            // @ts-ignore - accessing private property for testing
            expect(donationElement.isInServiceMode).toBe(true);
            expect(initialiseSpy).toHaveBeenCalled();

            initialiseSpy.mockRestore();
        });

        test('should not enter service mode when session does not exist', () => {
            const coreWithoutSession = setupCoreMock({ mockSessions: false });
            // @ts-ignore - clear session
            coreWithoutSession.session = undefined;

            const initialiseSpy = jest.spyOn(DonationCampaignService.prototype, 'initialise');

            // @ts-ignore - not all props needed
            new DonationElement(coreWithoutSession, serviceModeProps);

            expect(initialiseSpy).not.toHaveBeenCalled();

            initialiseSpy.mockRestore();
        });

        test('should not enter service mode when rootNode does not exist', () => {
            const coreWithSession = setupCoreMock({ mockSessions: true });
            // @ts-ignore - accessing private property for testing
            coreWithSession.options = { donation: { delay: 0 } };

            const initialiseSpy = jest.spyOn(DonationCampaignService.prototype, 'initialise');

            const { rootNode: _unused, ...depletedProps } = serviceModeProps;

            // @ts-ignore - not all props needed
            new DonationElement(coreWithSession, depletedProps);

            expect(initialiseSpy).not.toHaveBeenCalled();

            initialiseSpy.mockRestore();
        });

        test('should not enter service mode when rootNode is null', () => {
            const coreWithSession = setupCoreMock({ mockSessions: true });
            // @ts-ignore - accessing private property for testing
            coreWithSession.options = { donation: { delay: 0 } };

            const initialiseSpy = jest.spyOn(DonationCampaignService.prototype, 'initialise');

            const depletedProps = {
                ...serviceModeProps,
                rootNode: null
            };

            // @ts-ignore - not all props needed
            new DonationElement(coreWithSession, depletedProps);

            expect(initialiseSpy).not.toHaveBeenCalled();

            initialiseSpy.mockRestore();
        });

        test('should not enter service mode when rootNode is an empty string', () => {
            const coreWithSession = setupCoreMock({ mockSessions: true });
            // @ts-ignore - accessing private property for testing
            coreWithSession.options = { donation: { delay: 0 } };

            const initialiseSpy = jest.spyOn(DonationCampaignService.prototype, 'initialise');

            const depletedProps = {
                ...serviceModeProps,
                rootNode: ''
            };

            // @ts-ignore - not all props needed
            new DonationElement(coreWithSession, depletedProps);

            expect(initialiseSpy).not.toHaveBeenCalled();

            initialiseSpy.mockRestore();
        });

        test('should mount component when initialise returns valid campaign configuration', async () => {
            const coreWithSession = setupCoreMock({ mockSessions: true });
            // @ts-ignore - set options
            coreWithSession.options = { donation: { delay: 0 } };

            const mockConfig = {
                ...serviceModeMockCampaign,
                onDonate: jest.fn(),
                onCancel: jest.fn(),
                commercialTxAmount: 1000
            };

            // @ts-ignore - mock doesn't need all DonationConfiguration properties
            const initialiseSpy = jest.spyOn(DonationCampaignService.prototype, 'initialise').mockResolvedValue(mockConfig);

            // @ts-ignore - not all props needed
            const donationElement = new DonationElement(coreWithSession, serviceModeProps);
            const mountSpy = jest.spyOn(donationElement, 'mount');

            await waitFor(() => {
                expect(mountSpy).toHaveBeenCalledWith('#donation-container');
            });

            initialiseSpy.mockRestore();
        });

        test('should not mount component when initialise returns null (no campaigns)', async () => {
            const coreWithSession = setupCoreMock({ mockSessions: true });
            // @ts-ignore - set options
            coreWithSession.options = { donation: { delay: 0 } };

            const initialiseSpy = jest.spyOn(DonationCampaignService.prototype, 'initialise').mockResolvedValue(null);

            // @ts-ignore - not all props needed
            const donationElement = new DonationElement(coreWithSession, serviceModeProps);
            const mountSpy = jest.spyOn(donationElement, 'mount');

            // Wait a tick for the promise to resolve
            await new Promise(resolve => setTimeout(resolve, 10));

            expect(mountSpy).not.toHaveBeenCalled();

            initialiseSpy.mockRestore();
        });

        test('should call onError callback when initialise rejects', async () => {
            const onError = jest.fn();
            const coreWithSession = setupCoreMock({ mockSessions: true });
            // @ts-ignore - set options
            coreWithSession.options = { donation: { delay: 0, onError } };

            const testError = new Error('Campaign fetch failed');
            const initialiseSpy = jest.spyOn(DonationCampaignService.prototype, 'initialise').mockRejectedValue(testError);

            // @ts-ignore - not all props needed
            new DonationElement(coreWithSession, serviceModeProps);

            await waitFor(() => {
                expect(onError).toHaveBeenCalledWith(testError);
            });

            initialiseSpy.mockRestore();
        });
    });
});
