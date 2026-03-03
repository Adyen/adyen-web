import type { ICore } from '../../core/types';
import type { UIElementProps } from '../internal/UIElement/types';
import type { DonationCampaign, DonationConfiguration } from './types';
import type { DonationPayload } from './components/types';
import type {
    CheckoutSessionDonationCampaignsResponse,
    CheckoutSessionDonationsRequestData,
    CheckoutSessionDonationsResponse
} from '../../core/CheckoutSession/types';
import { normalizeDonationCampaign } from './utils';
import Donation from './Donation';
import { getDonationComponent } from './components/utils';
import { TxVariants } from '../tx-variants';
// import { AnalyticsLogEvent, LogEventType } from '../../core/Analytics/events/AnalyticsLogEvent';

export interface DonationCampaignProviderProps extends UIElementProps {
    originalComponentType: string;
    rootNode: HTMLElement;
    checkout: ICore;
}

class DonationCampaignProvider {
    public static type = 'donationCampaignProvider';

    private originalComponentType: string;
    private rootNode: HTMLElement;
    private checkout: ICore;

    private donationComponent: Donation;

    constructor(props?: DonationCampaignProviderProps) {
        this.originalComponentType = props?.originalComponentType;
        this.rootNode = props?.rootNode;
        this.checkout = props?.checkout;

        this.callSessionsDonationCampaigns();
    }

    private callSessionsDonationCampaigns() {
        // TODO add analytics
        // const event = new AnalyticsLogEvent({
        //     component: this.originalComponentType,
        //     // @ts-ignore
        //     type: LogEventType.donationCampaign, // TODO will need a new type... donationCampaign?
        //     message: 'Sessions flow: calling donationCampaigns endpoint'
        // });
        // this.checkout.modules.analytics.sendAnalytics(event);

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
                    // Allow time for any success message to show - TODO need to decide how best to handle this
                    setTimeout(() => {
                        /** And then we can handle the actual Donation component */
                        this.handleDonationCampaign(donationCampaign);
                    }, 2000);
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

        /**
         * Create the DonationComponent instance (via registry to avoid circular dependencies)
         */
        this.donationComponent = getDonationComponent(TxVariants.donation, this.checkout, {
            ...donationComponentProps
        });

        // Fail quietly
        if (!this.donationComponent) {
            console.warn('The Donation component is not registered and so cannot be rendered');
            return;
        }

        this.donationComponent.mount(this.rootNode);
    }

    private callSessionsDonations(donationRequestData: CheckoutSessionDonationsRequestData, component: Donation) {
        // TODO add analytics
        // const event = new AnalyticsLogEvent({
        //     component: originalComponentType,
        //     // @ts-ignore
        //     type: LogEventType.donationFromSessions, // TODO will need a new type... donationFromSessions?
        //     message: 'Sessions flow: calling donations endpoint'
        // });
        // this.checkout.modules.analytics.sendAnalytics(event);

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
            return await this.checkout.session.donationCampaigns();
        } catch (error: unknown) {
            // TODO - analytics?

            return Promise.reject(error);
        }
    }

    private async makeSessionDonationsCall(donationRequestData: CheckoutSessionDonationsRequestData): Promise<CheckoutSessionDonationsResponse> {
        try {
            return await this.checkout.session.donations(donationRequestData);
        } catch (error: unknown) {
            // TODO - analytics?

            return Promise.reject(error);
        }
    }
}

export default DonationCampaignProvider;
