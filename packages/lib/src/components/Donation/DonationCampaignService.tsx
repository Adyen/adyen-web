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

export const DEFAULT_DONATION_AUTO_START_DELAY_MS = 3000;

export const REPARENT_WITHOUT_AUTO_START_ERROR_MSG =
    'Donation instantiation error:: You need to set donation.autoMount to false if you wish to display the Donation component in a different container.\nThe Donation component will be displayed in the default container.';

class DonationCampaignService {
    public static readonly type = 'donationCampaignService';

    private readonly core: ICore;

    private readonly commercialTxAmount: number = 0;
    private readonly onDonationCompleted?: (result: { didDonate: boolean }) => void;
    private readonly onDonationFailed?: (reason: unknown) => void;

    private readonly delayMS: number;

    constructor(checkout: ICore, donationCampaignProps: DonationCampaignOptions) {
        this.core = checkout;

        this.onDonationCompleted = checkout.options.donation?.onDonationSuccess;
        this.onDonationFailed = checkout.options.donation?.onDonationFailure;

        this.commercialTxAmount = donationCampaignProps.commercialTxAmount;

        this.delayMS = checkout.options.donation?.delay ?? DEFAULT_DONATION_AUTO_START_DELAY_MS;
    }

    public async initialise(): Promise<DonationConfiguration | null> {
        const [donationConfiguration] = await Promise.all([
            this.callSessionsDonationCampaigns(),
            new Promise(resolve => setTimeout(resolve, this.delayMS))
        ]);
        return donationConfiguration;
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

                void this.callSessionsDonations(donationRequestData, component);
            },
            commercialTxAmount: this.commercialTxAmount
        };

        if (donationType === 'roundup' && !this.commercialTxAmount) {
            // This error will be handled gracefully by the Donation component. The question remains whether we want analytics on this?
            throw new Error(
                'The donation type is "roundup" and the commercialTxAmount is not set.\nIt will not be possible to mount a Donation component.'
            );
        }

        return donationComponentProps;
    }

    private async callSessionsDonations(donationRequestData: CheckoutSessionDonationsRequestData, component: Donation): Promise<void> {
        try {
            const response: CheckoutSessionDonationsResponse = await this.makeSessionDonationsCall(donationRequestData);

            if (response.resultCode === 'Authorised') {
                component.setStatus('success');
                this.onDonationCompleted?.({ didDonate: true });
            } else {
                component.setStatus('error');
                this.onDonationFailed?.(response.resultCode);
            }
        } catch (error: unknown) {
            component.setStatus('error');
            this.onDonationFailed?.(error);
        }
    }

    private async makeSessionsDonationCampaignsCall(): Promise<CheckoutSessionDonationCampaignsResponse> {
        if (!this.core.session) {
            throw new Error('DonationCampaignService requires a session to be configured');
        }
        return await this.core.session.fetchDonationCampaigns();
    }

    private async makeSessionDonationsCall(donationRequestData: CheckoutSessionDonationsRequestData): Promise<CheckoutSessionDonationsResponse> {
        if (!this.core.session) {
            throw new Error('DonationCampaignService requires a session to be configured');
        }
        return await this.core.session.makeDonation(donationRequestData);
    }
}

export default DonationCampaignService;
