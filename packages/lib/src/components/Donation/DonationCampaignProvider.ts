import type { DonationCampaign, DonationConfiguration } from './types';
import type { DonationPayload } from './components/types';
import type DonationElement from './Donation';
import type { ICore } from '../../core/types';
import type { CheckoutSessionDonationsRequestData, CheckoutSessionDonationsResponse } from '../../core/CheckoutSession/types';
import { getDonationComponent } from './components/utils';
import { TxVariants } from '../tx-variants';
import { normalizeDonationCampaign } from './utils';
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
    // Needed atm while the issue around the /donationCampaigns endpoint returning "sessionsDonation" c.f. the expected "donation" is resolved
    const normalisedDonationCampaign = normalizeDonationCampaign(donationCampaign);

    const { id, campaignName, ...restDonationCampaignProps } = normalisedDonationCampaign;

    const donationType = restDonationCampaignProps.donation.type;

    const donationComponentProps: DonationConfiguration = {
        onCancel(data) {
            console.log('### Donation::onCancel:: data', data);
            // TODO add analytics? - data shows whether shopper chose an amount, and, since they're here, that they then didn't proceed

            unmountFn();
        },
        onDonate: (state: DonationPayload, component: DonationElement) => {
            const donationRequestData: CheckoutSessionDonationsRequestData = {
                amount: state.data.amount,
                donationCampaignId: id,
                donationType: donationType
            };

            callSessionsDonations(donationRequestData, component, core, originalComponentType);
        },
        ...restDonationCampaignProps
    };

    // Unmount the current component
    unmountFn();

    // Retrieve and mount the Donation component
    const donationComponent: DonationElement = getDonationComponent(TxVariants.donation, core, donationComponentProps);
    if (!donationComponent) {
        console.warn('Donation Component is not available');
        return false;
    }

    donationComponent.mount(rootNode);

    return true;
};

const callSessionsDonations = (
    donationRequestData: CheckoutSessionDonationsRequestData,
    component: DonationElement,
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
        // TODO - analytics?

        return Promise.reject(error);
    }
};
