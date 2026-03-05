import type { ICore } from '../../core/types';
import type { DonationCampaign, DonationConfiguration } from './types';
import type { DonationPayload } from './components/types';
import type {
    CheckoutSessionDonationCampaignsResponse,
    CheckoutSessionDonationsRequestData,
    CheckoutSessionDonationsResponse
} from '../../core/CheckoutSession/types';
import { normalizeDonationCampaign } from './utils';
import Donation from './Donation';

class DonationCampaignProvider {
    public static type = 'donationCampaignProvider';

    private _rootNode: HTMLElement | string;
    private _originalComponentType: string = DonationCampaignProvider.type;

    private readonly core: ICore;

    private autoStartTimer: ReturnType<typeof setTimeout>;
    private readonly autoStartTimerMS = 3000;

    private donationComponent: Donation;

    // TODO - if set up as a module, there will probably only be one parameter, checkout, so we can change the signature (it doesn't need to be a props object)
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
     * @internal
     */
    public set componentType(type: string) {
        this._originalComponentType = type;
    }

    /**
     * @internal
     */
    public beginCountdown() {
        if (this.autoStartTimer) {
            clearTimeout(this.autoStartTimer);
        }

        this.autoStartTimer = setTimeout(() => {
            this.init();
        }, this.autoStartTimerMS);
    }

    /**
     * Exposed method for the merchant to halt the auto start timer. meaning it will then be up to them to call start() to begin the process
     */
    public haltAutoStart() {
        clearTimeout(this.autoStartTimer);
    }

    public start() {
        // Clear the timeout in case the merchant hasn't halted it, otherwise we could end up with a double call to the /donationCampaigns endpoint
        this.haltAutoStart();
        this.init();
    }

    private init() {
        this.callSessionsDonationCampaigns();
    }

    private callSessionsDonationCampaigns() {
        // TODO add analytics
        // const event = new AnalyticsLogEvent({
        //     component: this._originalComponentType,
        //     // @ts-ignore
        //     type: LogEventType.donationCampaign, // TODO will need a new type... donationCampaign?
        //     message: 'Sessions flow: calling donationCampaigns endpoint'
        // });
        // this.core.modules.analytics.sendAnalytics(event);

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
        const normalisedDonationCampaign = normalizeDonationCampaign(donationCampaign);

        const { id, campaignName, ...restDonationCampaignProps } = normalisedDonationCampaign;

        const donationType = restDonationCampaignProps.donation.type;

        const donationComponentProps: DonationConfiguration = {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            onCancel: data => {
                // console.log('### Donation::onCancel:: data', data);
                // TODO add analytics? - data shows whether shopper chose an amount, and, since they're here, that they then didn't proceed

                // TODO - call a onDonationCancel callback?

                this.donationComponent.unmount();
            },
            onDonate: (state: DonationPayload, component: Donation) => {
                const donationRequestData: CheckoutSessionDonationsRequestData = {
                    amount: state.data.amount,
                    donationCampaignId: id,
                    donationType: donationType
                };

                this.callSessionsDonations(donationRequestData, component);
            },
            ...restDonationCampaignProps
        };

        this.donationComponent = new Donation(this.core, {
            ...donationComponentProps
        });

        this.donationComponent.mount(this.rootNode);
    }

    private callSessionsDonations(donationRequestData: CheckoutSessionDonationsRequestData, component: Donation) {
        // TODO add analytics
        // const event = new AnalyticsLogEvent({
        //     component: this._originalComponentType,
        //     // @ts-ignore
        //     type: LogEventType.donationFromSessions, // TODO will need a new type... donationFromSessions?
        //     message: 'Sessions flow: calling donations endpoint'
        // });
        // this.core.modules.analytics.sendAnalytics(event);

        this.makeSessionDonationsCall(donationRequestData)
            .then((response: CheckoutSessionDonationsResponse) => {
                if (response.resultCode === 'Authorised') {
                    component.setStatus('success');
                } else {
                    component.setStatus('error');
                }

                // TODO - call a onDonationComplete callback?
            })
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            .catch((error: unknown) => {
                component.setStatus('error');
            });
    }

    private async makeSessionsDonationCampaignsCall(): Promise<CheckoutSessionDonationCampaignsResponse> {
        try {
            return await this.core.session.donationCampaigns();
        } catch (error: unknown) {
            // TODO - analytics?

            return Promise.reject(error);
        }
    }

    private async makeSessionDonationsCall(donationRequestData: CheckoutSessionDonationsRequestData): Promise<CheckoutSessionDonationsResponse> {
        try {
            return await this.core.session.donations(donationRequestData);
        } catch (error: unknown) {
            // TODO - analytics?

            return Promise.reject(error);
        }
    }
}

export default DonationCampaignProvider;
