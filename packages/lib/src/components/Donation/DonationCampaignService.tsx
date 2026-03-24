import type { ICore } from '../../core/types';
import { DonationCampaign, DonationConfiguration, DonationCampaignOptions } from './types';
import type { DonationPayload } from './components/types';
import type {
    CheckoutSessionDonationCampaignsResponse,
    CheckoutSessionDonationsRequestData,
    CheckoutSessionDonationsResponse
} from '../../core/CheckoutSession/types';
import Donation from './Donation';
import { AnalyticsLogEvent, LogEventSubtype, LogEventType } from '../../core/Analytics/events/AnalyticsLogEvent';

const DEFAULT_DONATION_AUTO_START_DELAY_MS = 3000;

export const REPARENT_WITHOUT_AUTO_START_ERROR_MSG =
    'DonationCampaignService:: You need to set donation.autoStart to false if you wish to display the Donation component in a different container.';

class DonationCampaignService {
    public static type = 'donationCampaignService';

    private static instanceCount: number = 0;

    private readonly core: ICore;

    private readonly commercialTxAmount: number = 0;
    private readonly onDonationCompleted: (result: { didDonate: boolean }) => void;
    private readonly onDonationFailed: (reason: unknown) => void;

    private readonly delayMS: number;

    constructor(checkout: ICore, donationCampaignProps: DonationCampaignOptions) {
        DonationCampaignService.instanceCount++;

        // If the merchant has not explicitly set autoStart to false, and then tries to display the Donation component in a different container,
        // we need to warn them otherwise, without this check, 2 calls to the /donationCampaigns endpoint will be made - since UIElement
        // will automatically mount the Donation component in the component's rootNode.
        if (DonationCampaignService.instanceCount > 1) {
            throw new Error(REPARENT_WITHOUT_AUTO_START_ERROR_MSG);
        }

        this.core = checkout;

        this.onDonationCompleted = (result: { didDonate: boolean }) => {
            // Reset the count now the process has finished
            DonationCampaignService.instanceCount = 0;

            // Call the merchant defined handler
            checkout.options.donation?.onSuccess(result);
        };
        this.onDonationFailed = (reason: unknown) => {
            DonationCampaignService.instanceCount = 0;
            checkout.options.donation?.onError(reason);
        };

        this.commercialTxAmount = donationCampaignProps.commercialTxAmount;

        this.delayMS = checkout.options.donation?.delay != null ? checkout.options.donation.delay : DEFAULT_DONATION_AUTO_START_DELAY_MS;
    }

    public async initialise(): Promise<DonationConfiguration | null> {
        await new Promise(resolve => setTimeout(resolve, this.delayMS));
        return this.callSessionsDonationCampaigns();
    }

    private async callSessionsDonationCampaigns(): Promise<DonationConfiguration | null> {
        // Send analytics
        const event = new AnalyticsLogEvent({
            component: DonationCampaignService.type,
            type: LogEventType.apiRequest,
            subType: LogEventSubtype.donationCampaigns,
            message: 'Sessions flow: calling donationCampaigns endpoint'
        });
        this.core.modules.analytics.sendAnalytics(event);

        const response: CheckoutSessionDonationCampaignsResponse = await this.makeSessionsDonationCampaignsCall();
        const [donationCampaign] = response?.donationCampaigns || [];
        return donationCampaign ? this.handleDonationCampaign(donationCampaign) : null;
    }

    private handleDonationCampaign(donationCampaign: DonationCampaign): DonationConfiguration {
        const { id, campaignName, ...restDonationCampaignProps } = donationCampaign;

        const donationType = restDonationCampaignProps.donation.type;

        const donationComponentProps: DonationConfiguration = {
            ...(restDonationCampaignProps as DonationConfiguration),

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            onCancel: (state: DonationPayload) => {
                // Call merchant defined onDonationCompleted callback
                this.onDonationCompleted?.({ didDonate: false });
            },
            onDonate: (state: DonationPayload, component: Donation) => {
                // Make the request
                const donationRequestData: CheckoutSessionDonationsRequestData = {
                    amount: state.data.amount,
                    donationCampaignId: id,
                    donationType: donationType
                };

                this.callSessionsDonations(donationRequestData, component);
            },
            commercialTxAmount: this.commercialTxAmount
        };

        if (donationType === 'roundup' && !this.commercialTxAmount) {
            // TODO - analytics?
            // This error will be handled gracefully by the Donation component
            throw new Error(
                'The donation type is "roundup" and the commercialTxAmount is not set.\nIt will not be possible to mount a Donation component.'
            );
        }

        return donationComponentProps;
    }

    private callSessionsDonations(donationRequestData: CheckoutSessionDonationsRequestData, component: Donation) {
        this.makeSessionDonationsCall(donationRequestData)
            .then((response: CheckoutSessionDonationsResponse) => {
                if (response.resultCode === 'Authorised') {
                    component.setStatus('success');

                    this.onDonationCompleted?.({ didDonate: true });
                } else {
                    component.setStatus('error');

                    // Call merchant defined onDonationFailed callback
                    this.onDonationFailed?.(response.resultCode);
                }
            })

            .catch((error: unknown) => {
                component.setStatus('error');
                this.onDonationFailed?.(error);
            });
    }

    private async makeSessionsDonationCampaignsCall(): Promise<CheckoutSessionDonationCampaignsResponse> {
        try {
            return await this.core.session.donationCampaigns();
        } catch (error: unknown) {
            return Promise.reject(error);
        }
    }

    private async makeSessionDonationsCall(donationRequestData: CheckoutSessionDonationsRequestData): Promise<CheckoutSessionDonationsResponse> {
        try {
            return await this.core.session.donations(donationRequestData);
        } catch (error: unknown) {
            return Promise.reject(error);
        }
    }
}

export default DonationCampaignService;
