import type { ICore } from '../../core/types';
import type { DonationCampaign, DonationConfiguration } from './types';
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

class DonationCampaignProvider {
    public static type = 'donationCampaignProvider';

    private readonly core: ICore;

    private _rootNode: HTMLElement | string = null;

    private commercialTxAmount: number = 0;
    private onDonationCompleted: DonationCampaignProviderSetup['onDonationCompleted'];
    private onDonationFailed: DonationCampaignProviderSetup['onDonationFailed'];

    private autoStartTimer: ReturnType<typeof setTimeout> = null;
    private readonly autoStartTimerMS = 3000;

    private donationComponent: Donation;

    constructor(checkout: ICore) {
        this.core = checkout;
    }

    /**
     * Exposed methods for the merchant to get/set the root node - which is where the Donation component will be mounted
     */
    public get rootNode(): HTMLElement | string {
        return this._rootNode;
    }

    public set rootNode(node: HTMLElement | string) {
        this._rootNode = node;
    }

    /**
     * Exposed method for the merchant to halt the auto start timer - meaning it will then be up to them to call start() to begin the process
     */
    public haltAutoStart() {
        clearTimeout(this.autoStartTimer);
    }

    /**
     * Exposed method for the merchant to manually begin the process
     */
    public start() {
        // Clear the timeout in case the merchant hasn't halted it, otherwise we could end up with a double call to the /donationCampaigns endpoint
        this.haltAutoStart();
        this.init();
    }

    /**
     * @internal
     */
    public setupAndStart({ rootNode, commercialTxAmount, onDonationCompleted, onDonationFailed }: DonationCampaignProviderSetup) {
        this.rootNode = rootNode;
        this.commercialTxAmount = commercialTxAmount;
        this.onDonationCompleted = onDonationCompleted;
        this.onDonationFailed = onDonationFailed;

        this.beginCountdown();
    }

    private beginCountdown() {
        if (this.autoStartTimer) {
            clearTimeout(this.autoStartTimer);
        }

        this.autoStartTimer = setTimeout(() => {
            this.init();
        }, this.autoStartTimerMS);
    }

    private init() {
        this.callSessionsDonationCampaigns();
    }

    private callSessionsDonationCampaigns() {
        // Send analytics
        const event = new AnalyticsLogEvent({
            component: DonationCampaignProvider.type,
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

        this.donationComponent = new Donation(this.core, {
            ...donationComponentProps
        });

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

export default DonationCampaignProvider;
