import UIElement from '../internal/UIElement';
import { h } from 'preact';
import type { ICore } from '../../core/types';
import type { UIElementProps } from '../internal/UIElement/types';
import type { DonationCampaign, DonationConfiguration } from './types';
import type { DonationPayload } from './components/types';
import type DonationElement from './Donation';
import type {
    CheckoutSessionDonationCampaignsResponse,
    CheckoutSessionDonationsRequestData,
    CheckoutSessionDonationsResponse
} from '../../core/CheckoutSession/types';
import { normalizeDonationCampaign } from './utils';
import Donation from './Donation';
// import { AnalyticsLogEvent, LogEventType } from '../../core/Analytics/events/AnalyticsLogEvent';

export interface DonationCampaignProviderProps extends UIElementProps {
    originalComponentType: string;
    rootNode: HTMLElement;
}

class DonationCampaignProvider extends UIElement<DonationCampaignProviderProps> {
    public static type = 'donationCampaignProvider';

    private originalComponentType: string;
    private rootNode: HTMLElement;

    private holderRef: HTMLElement;

    private donationComponent: DonationElement | null = null;

    constructor(checkout: ICore, props?: DonationCampaignProviderProps) {
        super(checkout, props);

        this.originalComponentType = props?.originalComponentType;
        this.rootNode = props?.rootNode;

        this.callSessionsDonationCampaigns();
    }

    protected override beforeRender() {
        /* Do not send rendered analytics event for his "holder" component - we are more concerned with hearing that the Donation component has rendered */
    }

    private callSessionsDonationCampaigns() {
        // TODO add analytics
        // const event = new AnalyticsLogEvent({
        //     component: this.originalComponentType,
        //     // @ts-ignore
        //     type: LogEventType.donationCampaign, // TODO will need a new type... donationCampaign?
        //     message: 'Sessions flow: calling donationCampaigns endpoint'
        // });
        // this.submitAnalytics(event);

        this.makeSessionsDonationCampaignsCall()
            .then((response: CheckoutSessionDonationCampaignsResponse) => {
                console.log('### DonationCampaignProvider2::makeSessionDonationCampaignsCall:: response', response);

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
                        /** Now we know we have a donation campaign we can mount this "holder" component into the UI */
                        this.mount(this.rootNode);

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
            onCancel: data => {
                console.log('### Donation::onCancel:: data', data);
                // TODO add analytics? - data shows whether shopper chose an amount, and, since they're here, that they then didn't proceed

                // TODO - call a onDonationCancel callback?

                this.unmount();
            },
            onDonate: (state: DonationPayload, component: DonationElement) => {
                const donationRequestData: CheckoutSessionDonationsRequestData = {
                    amount: state.data.amount,
                    donationCampaignId: id,
                    donationType: donationType
                };

                this.callSessionsDonations(donationRequestData, component);
            },
            ...restDonationCampaignProps
        };

        this.donationComponent = new Donation(this.core, donationComponentProps).mount(this.holderRef);
    }

    private callSessionsDonations(donationRequestData: CheckoutSessionDonationsRequestData, component: DonationElement) {
        // TODO add analytics
        // const event = new AnalyticsLogEvent({
        //     component: originalComponentType,
        //     // @ts-ignore
        //     type: LogEventType.donationFromSessions, // TODO will need a new type... donationFromSessions?
        //     message: 'Sessions flow: calling donations endpoint'
        // });
        // this.submitAnalytics(event);

        this.makeSessionDonationsCall(donationRequestData)
            .then((response: CheckoutSessionDonationsResponse) => {
                console.log('### DonationCampaignProvider2::makeSessionsDonationsCall:: response', response);
                if (response.resultCode === 'Authorised') {
                    component.setStatus('success');
                } else {
                    component.setStatus('error');
                }

                // TODO - call a onDonationComplete callback?
            })
            .catch((error: unknown) => {
                console.log('### DonationCampaignProvider2::makeSessionsDonationsCall:: error', error);
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

    protected override componentToRender(): h.JSX.Element {
        return (
            <div
                id={'donationCampaignProvider'}
                ref={ref => {
                    this.holderRef = ref;
                }}
            />
        );
    }
}

export default DonationCampaignProvider;
