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
    unmountFn: () => void;
    rootNode: HTMLElement;
}

class DonationCampaignProvider extends UIElement<DonationCampaignProviderProps> {
    public static type = 'donationCampaignProvider';

    private originalComponentType: string;
    private unmountFn: () => void;
    private rootNode: HTMLElement;

    private donationComponent: DonationElement | null = null;

    constructor(checkout: ICore, props?: DonationCampaignProviderProps) {
        super(checkout, props);

        this.originalComponentType = props?.originalComponentType;
        this.unmountFn = props?.unmountFn;
        this.rootNode = props?.rootNode;

        // this.unmount = this.unmount.bind(this);

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
                        this.mount(this.rootNode);
                        // this.handleDonationCampaign(donationCampaign);
                    }, 2000);
                    setTimeout(() => {
                        // this.mount(this.rootNode);
                        this.handleDonationCampaign(donationCampaign);
                    }, 4000);
                }
            })
            .catch((error: unknown) => {
                console.debug('DonationCampaignProvider::makeSessionDonationCampaignsCall:: error', error);
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

    private handleDonationCampaign(donationCampaign: DonationCampaign) {
        const normalisedDonationCampaign = normalizeDonationCampaign(donationCampaign);

        const { id, campaignName, ...restDonationCampaignProps } = normalisedDonationCampaign;

        const donationType = restDonationCampaignProps.donation.type;

        console.log('### DonationCampaignProvider2::handleDonationCampaign:: this', this);

        const donationComponentProps: DonationConfiguration = {
            onCancel: data => {
                console.log('### Donation::onCancel:: data', data);
                // TODO add analytics? - data shows whether shopper chose an amount, and, since they're here, that they then didn't proceed

                console.log('### DonationCampaignProvider2::onCancel:: this', this);
                // this.unmountFn();
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

        // Unmount the previous component
        // this.unmountFn();

        // Retrieve and mount the Donation component
        // const donationComponent: DonationElement = getDonationComponent(TxVariants.donation, this.core, donationComponentProps);
        // if (!donationComponent) {
        //     console.warn('Donation Component is not available');
        //     return false;
        // }

        const donationComponent: Donation = new Donation(this.core, donationComponentProps);
        console.log('### DonationCampaignProvider2::handleDonationCampaign::donationComponent ', donationComponent);
        this.donationComponent = donationComponent;

        // this.mount(this.rootNode);

        this.donationComponent.mount(this.componentRef);
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
            })
            .catch((error: unknown) => {
                console.log('### DonationCampaignProvider2::makeSessionsDonationsCall:: error', error);
            });
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
        // if (this.donationComponent) {
        console.log('### DonationCampaignProvider2::componentToRender:: ');
        // return this.donationComponent.render();
        // }
        return (
            <div
                id={'donationCampaignProvider'}
                ref={ref => {
                    this.componentRef = ref;
                }}
            />
        );
    }

    // public render() {
    //     //     if (this.donationComponent) {
    //     console.log('### DonationCampaignProvider2::render:: ');
    //     //         // return this.donationComponent.render();
    //     return this.componentToRender();
    //     //     }
    //     //     return <div id={'doncamppro'}></div>;
    // }
}

export default DonationCampaignProvider;
