import type { DonationCampaign, DonationPayload } from './components/types';
import type { ICore } from '../../core/types';
import { type Donation, type DonationConfiguration } from '../../types';
import type { CheckoutSessionDonationsRequestData, CheckoutSessionDonationsResponse } from '../../core/CheckoutSession/types';
import AdyenCheckoutError from '../../core/Errors/AdyenCheckoutError';
import { getDonationComponent } from './components/utils';
import { TxVariants } from '../tx-variants';
// import { AnalyticsLogEvent, LogEventType } from '../../core/Analytics/events/AnalyticsLogEvent';

interface DonationCampaignProviderProps {
    donationCampaign: DonationCampaign;
    core: ICore;
    originalComponentType: string;
    unmountFn: () => void;
    rootNode: HTMLElement;
}

export const DonationCampaignProvider = ({
    donationCampaign,
    core,
    originalComponentType,
    unmountFn,
    rootNode
}: DonationCampaignProviderProps): boolean => {
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

            callSessionsDonations(donationRequestData, component, core, originalComponentType);
        },
        ...restDonationCampaignProps
    };

    unmountFn();

    const donationComponent: Donation = getDonationComponent(TxVariants.donation, core, donationComponentProps);
    if (!donationComponent) {
        return false;
    }

    donationComponent.mount(rootNode);

    return true;
};

const callSessionsDonations = (
    donationRequestData: CheckoutSessionDonationsRequestData,
    component: Donation,
    core: ICore,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    originalComponentType: string
) => {
    // TODO add analytics
    // const event = new AnalyticsLogEvent({
    //     component: originalComponentType,
    //     // @ts-ignore
    //     type: LogEventType.donationFromSessions, // TODO will need a new type... donationFromSessions?
    //     message: 'Sessions flow: calling donations endpoint'
    // });
    // core.modules.analytics.sendAnalytics(event);

    makeSessionDonationsCall(donationRequestData, core)
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

const makeSessionDonationsCall = async (
    donationRequestData: CheckoutSessionDonationsRequestData,
    core: ICore
): Promise<CheckoutSessionDonationsResponse> => {
    try {
        return await core.session.donations(donationRequestData);
    } catch (error: unknown) {
        if (error instanceof AdyenCheckoutError) {
            // TODO - analytics?
        } else {
            // TODO - analytics?
        }

        return Promise.reject(error);
    }
};
