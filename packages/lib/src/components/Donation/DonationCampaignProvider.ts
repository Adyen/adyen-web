import type { VNode } from 'preact';
import type { DonationCampaign, DonationPayload } from './components/types';
import type { ICore } from '../../core/types';
// import type { IDropin } from '../Dropin/types';
import { type Donation, type DonationConfiguration, UIElement } from '../../types';
import type { CheckoutSessionDonationsRequestData, CheckoutSessionDonationsResponse } from '../../core/CheckoutSession/types';
import AdyenCheckoutError from '../../core/Errors/AdyenCheckoutError';
import { getDonationComponent } from './components/utils';
import { TxVariants } from '../tx-variants';

interface DonationCampaignProviderProps {
    donationCampaign: DonationCampaign;
    core: ICore;
    isDropin: boolean;
    dropinElementRef?: UIElement;
    unmountFn: () => void;
    rootNode: HTMLElement;
}

export const DonationCampaignProvider = ({
    donationCampaign,
    core,
    // isDropin,
    // dropinElementRef,
    unmountFn,
    rootNode
}: DonationCampaignProviderProps): VNode | null => {
    const { id, campaignName, ...restDonationCampaignProps } = donationCampaign;

    const donationType = restDonationCampaignProps.donation.type;

    console.log('### DonationCampaignProvider::rootNode', rootNode);

    const donationComponentProps: DonationConfiguration = {
        onCancel(data) {
            console.log('### Donation::onCancel:: data', data);
        },
        onDonate: (state: DonationPayload, component: Donation) => {
            const donationRequestData: CheckoutSessionDonationsRequestData = {
                amount: state.data.amount,
                donationCampaignId: id,
                donationType: donationType
            };

            callSessionsDonations(donationRequestData, component);
        },
        ...restDonationCampaignProps
    };

    // TODO - decide if we want to differentiate between the implementation for a Dropin and a Component.
    //  Will they both be done via a setStatus call? In which case we could just use: this.setElementStatus('donation', donationComponentProps);
    //  Or will the implementation for a component be different? In which case we need this if-clause
    // if (isDropin) {
    //     // dropinElementRef.setStatus('donation', { configProps: donationComponentProps });
    //
    //     // alt. to Dropin.setStatus
    //     //
    //     unmountFn();
    //     const donationComponent: Donation = getDonationComponent(TxVariants.donation, core, donationComponentProps);
    //     if (!donationComponent) {
    //         throw new Error('Donation component is not registered');
    //     }
    //     donationComponent.mount(rootNode);
    // } else {
    //     unmountFn();
    //
    //     const donationComponent: Donation = getDonationComponent(TxVariants.donation, core, donationComponentProps);
    //     if (!donationComponent) {
    //         throw new Error('Donation component is not registered and so cannot be rendered');
    //     }
    //
    //     donationComponent.mount(rootNode);
    // }

    unmountFn();
    const donationComponent: Donation = getDonationComponent(TxVariants.donation, core, donationComponentProps);
    if (!donationComponent) {
        throw new Error('Donation component is not registered');
    }
    donationComponent.mount(rootNode);

    const callSessionsDonations = (donationRequestData: CheckoutSessionDonationsRequestData, component: Donation) => {
        // TODO add analytics
        // const event = new AnalyticsLogEvent({
        //     component: this.type,
        //     type: LogEventType.donationFromSessions, // TODO will need a new type... donationFromSessions?
        //     message: 'Sessions flow: calling donations endpoint'
        // });
        // this.submitAnalytics(event);

        makeSessionDonationsCall(donationRequestData)
            .then((response: CheckoutSessionDonationsResponse) => {
                console.log('### DonationCampaignProvider::makeSessionDonationsCall:: response', response);
                if (response.resultCode === 'Authorised') {
                    component.setStatus('success');
                } else {
                    component.setStatus('error');
                }
            })
            .catch((error: unknown) => {
                console.log('### DonationCampaignProvider::makeSessionDonationsCall:: error', error);
            });
    };

    const makeSessionDonationsCall = async (donationRequestData: CheckoutSessionDonationsRequestData): Promise<CheckoutSessionDonationsResponse> => {
        try {
            return await core.session.donations(donationRequestData);
        } catch (error: unknown) {
            if (error instanceof AdyenCheckoutError) {
                // this.handleError(error);
            } else {
                // this.handleError(new AdyenCheckoutError('ERROR', 'Error when making /donations call', { cause: error }));
            }

            return Promise.reject(error);
        }
    };
    return null;
};
