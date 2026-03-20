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

class DonationCampaignService {
    public static type = 'donationCampaignService';

    private static instanceCount: number = 0;

    private readonly core: ICore;

    private readonly rootNode: HTMLElement | string = null;

    private readonly commercialTxAmount: number = 0;
    private readonly onDonationCompleted: (didDonate: boolean) => void;
    private readonly onDonationFailed: (reason: unknown) => void;

    private readonly autoStartTimerMS = 3000;
    private readonly delayMS: number;

    constructor(checkout: ICore, dcpProps?: DonationCampaignOptions) {
        DonationCampaignService.instanceCount++;

        // If the merchant has not explicitly set autoStart to false, and then tries to display the Donation component in a different container,
        // we need to warn them otherwise, without this check, 2 calls to the /donationCampaigns endpoint will be made - since UIElement
        // will automatically mount the Donation component in the component's rootNode.
        if (DonationCampaignService.instanceCount > 1) {
            throw new Error(
                'DonationCampaignService:: You need to set donation.autoStart to false if you wish to display the Donation component in a different container.'
            );
        }

        this.core = checkout;

        this.onDonationCompleted = checkout.options.donation?.onSuccess;

        this.onDonationFailed = checkout.options.donation?.onError;

        this.rootNode = dcpProps.rootNode;
        this.commercialTxAmount = dcpProps.commercialTxAmount;

        this.delayMS = checkout.options.donation?.delay != null ? checkout.options.donation.delay : this.autoStartTimerMS;

        return this;
    }

    public async initialise(): Promise<DonationConfiguration | null> {
        await new Promise(resolve => setTimeout(resolve, this.delayMS));
        return this.callSessionsDonationCampaigns();
    }

    private callSessionsDonationCampaigns(): Promise<DonationConfiguration | null> {
        // Send analytics
        const event = new AnalyticsLogEvent({
            component: DonationCampaignService.type,
            type: LogEventType.apiRequest,
            subType: LogEventSubtype.donationCampaigns,
            message: 'Sessions flow: calling donationCampaigns endpoint'
        });
        this.core.modules.analytics.sendAnalytics(event);

        return this.makeSessionsDonationCampaignsCall()
            .then((response: CheckoutSessionDonationCampaignsResponse) => {
                if (response?.donationCampaigns?.length) {
                    // Choose which campaign to return - currently just pick the first one
                    return response.donationCampaigns[0];
                } else {
                    return null;
                }
            })
            .then((donationCampaign: DonationCampaign) => {
                if (donationCampaign) {
                    return this.handleDonationCampaign(donationCampaign);
                }
                return null;
            })
            .catch((error: unknown) => {
                throw error;
            });
    }

    private handleDonationCampaign(donationCampaign: DonationCampaign): DonationConfiguration {
        const { id, campaignName, ...restDonationCampaignProps } = donationCampaign;

        let donationType = restDonationCampaignProps.donation.type;

        restDonationCampaignProps.donation = {
            currency: 'EUR',
            type: 'roundup',
            maxRoundupAmount: 100
        };
        donationType = 'roundup';

        const donationComponentProps: DonationConfiguration = {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            onCancel: (state: DonationPayload) => {
                // Call merchant defined onDonationCompleted callback
                this.onDonationCompleted?.(false);
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
            commercialTxAmount: this.commercialTxAmount,
            ...(restDonationCampaignProps as DonationConfiguration)
        };

        if (donationType === 'roundup' && !this.commercialTxAmount) {
            // TODO - analytics?
            // This will be handled gracefully by the Donation component via the catch in callSessionsDonationCampaigns
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

                    this.onDonationCompleted?.(true);
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
