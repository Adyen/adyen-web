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

type DonationCampaignProviderSetup = {
    rootNode: HTMLElement;
    commercialTxAmount: number;
    onDonationCompleted: (didDonate: boolean) => void;
    onDonationFailed: (reason: unknown) => void;
};

class DonationCampaignService {
    public static type = 'donationCampaignService';

    private static instanceCount: number = 0;

    private readonly core: ICore;

    private readonly rootNode: HTMLElement | string = null;

    private readonly commercialTxAmount: number = 0;
    private readonly onDonationCompleted: DonationCampaignProviderSetup['onDonationCompleted'];
    private readonly onDonationFailed: DonationCampaignProviderSetup['onDonationFailed'];

    private autoStartTimer: ReturnType<typeof setTimeout> = null;
    private readonly autoStartTimerMS = 3000;

    private donationComponent: Donation;

    constructor(checkout: ICore, donationComp: Donation, dcpProps?: DonationCampaignOptions) {
        DonationCampaignService.instanceCount++;

        // If the merchant has not explicitly set autoStart to false, and then tries to display the Donation component in a different container,
        // we need to warn them otherwise, without this check, 2 calls to the /donationCampaigns endpoint will be made - since UIElement
        // will automatically mount the Donation component in the component's rootNode.
        if (DonationCampaignService.instanceCount > 1) {
            console.warn('You need to set donation.autoStart to false if you wish to display the Donation component in a different container');
            return;
        }

        this.core = checkout;

        this.onDonationCompleted = checkout.options.donation?.onSuccess;
        this.onDonationFailed = checkout.options.donation?.onError;

        this.donationComponent = donationComp;

        this.rootNode = dcpProps.rootNode;
        this.commercialTxAmount = dcpProps.commercialTxAmount;

        this.beginCountdown(checkout.options.donation?.delay || this.autoStartTimerMS);
    }

    private beginCountdown(delay: number) {
        if (this.autoStartTimer) {
            clearTimeout(this.autoStartTimer);
        }

        this.autoStartTimer = setTimeout(() => {
            this.init();
        }, delay);
    }

    private init() {
        this.callSessionsDonationCampaigns();
    }

    private callSessionsDonationCampaigns() {
        // Send analytics
        const event = new AnalyticsLogEvent({
            component: DonationCampaignService.type,
            type: LogEventType.apiRequest,
            subType: LogEventSubtype.donationCampaigns,
            message: 'Sessions flow: calling donationCampaigns endpoint'
        });
        this.core.modules.analytics.sendAnalytics(event);

        this.makeSessionsDonationCampaignsCall()
            .then((response: CheckoutSessionDonationCampaignsResponse) => {
                if (response?.donationCampaigns?.length) {
                    // Choose which campaign to return - currently just pick the first one
                    return response.donationCampaigns[0];
                } else {
                    // Do nothing - TODO maybe analytics?
                    return null;
                }
            })
            .then((donationCampaign: DonationCampaign) => {
                if (donationCampaign) {
                    this.handleDonationCampaign(donationCampaign);
                }
            })
            .catch((error: unknown) => {
                console.debug('DonationCampaignProvider::makeSessionDonationCampaignsCall:: error', error);
            });
    }

    private handleDonationCampaign(donationCampaign: DonationCampaign) {
        const { id, campaignName, ...restDonationCampaignProps } = donationCampaign;

        const donationType = restDonationCampaignProps.donation.type;

        const donationComponentProps: DonationConfiguration = {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            onCancel: (state: DonationPayload) => {
                // Call merchant defined onDonationCompleted callback
                this.onDonationCompleted?.(false);

                this.donationComponent.unmount();
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

        // this.donationComponent = new Donation(this.core, {
        //     ...donationComponentProps
        // });

        // TODO - pass donationComponentProps to the Donation comp, somehow

        this.donationComponent.setProps(donationComponentProps);

        this.donationComponent.mount(this.rootNode);
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
            // TODO - analytics, or will this be picked up as part of the sessions endpoint httpPost handling?

            return Promise.reject(error);
        }
    }

    private async makeSessionDonationsCall(donationRequestData: CheckoutSessionDonationsRequestData): Promise<CheckoutSessionDonationsResponse> {
        try {
            return await this.core.session.donations(donationRequestData);
        } catch (error: unknown) {
            // TODO - analytics, or will this be picked up as part of the sessions endpoint httpPost handling?

            return Promise.reject(error);
        }
    }
}

export default DonationCampaignService;
