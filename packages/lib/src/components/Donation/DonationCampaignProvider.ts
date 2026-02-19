import type { DonationCampaign, DonationConfiguration } from './types';
import type { DonationPayload } from './components/types';
import type DonationElement from './Donation';
import type { ICore } from '../../core/types';
import type {
    CheckoutSessionDonationCampaignsResponse,
    CheckoutSessionDonationsRequestData,
    CheckoutSessionDonationsResponse
} from '../../core/CheckoutSession/types';
import { getDonationComponent } from './components/utils';
import { TxVariants } from '../tx-variants';
import { normalizeDonationCampaign } from './utils';
// import { AnalyticsLogEvent, LogEventType } from '../../core/Analytics/events/AnalyticsLogEvent';

interface DonationCampaignProviderProps {
    core: ICore;
    originalComponentType: string;
    unmountFn: () => void;
    rootNode: HTMLElement;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const DonationCampaignProvider = ({ core, originalComponentType, unmountFn, rootNode }: DonationCampaignProviderProps): void => {
    /**
     * Phase 1: Makes the /donationCampaigns call
     */
    const callSessionsDonationCampaigns = () => {
        // TODO add analytics
        // const event = new AnalyticsLogEvent({
        //     component: originalComponentType,
        //     // @ts-ignore
        //     type: LogEventType.donationCampaign, // TODO will need a new type... donationCampaign?
        //     message: 'Sessions flow: calling donationCampaigns endpoint'
        // });
        // core.modules.analytics.sendAnalytics(event);

        makeSessionsDonationCampaignsCall()
            .then((response: CheckoutSessionDonationCampaignsResponse) => {
                console.log('### DonationCampaignProvider::makeSessionDonationCampaignsCall:: response', response);

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
                        handleDonationCampaign(donationCampaign);
                    }, 2000);
                }
            })
            .catch((error: unknown) => {
                console.debug('DonationCampaignProvider::makeSessionDonationCampaignsCall:: error', error);
            });
    };

    const makeSessionsDonationCampaignsCall = async (): Promise<CheckoutSessionDonationCampaignsResponse> => {
        try {
            return await core.session.donationCampaigns();
        } catch (error: unknown) {
            // TODO - analytics?

            return Promise.reject(error);
        }
    };

    /**  Initiate Phase 1  */
    callSessionsDonationCampaigns();

    /**
     * Phase 2: Handles the retrieved campaign
     */
    const handleDonationCampaign = (donationCampaign: DonationCampaign): boolean => {
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

                callSessionsDonations(donationRequestData, component);
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

    /**
     * Phase 3: Makes the /donations call
     */
    const callSessionsDonations = (donationRequestData: CheckoutSessionDonationsRequestData, component: DonationElement) => {
        // TODO add analytics
        // const event = new AnalyticsLogEvent({
        //     component: originalComponentType,
        //     // @ts-ignore
        //     type: LogEventType.donationFromSessions, // TODO will need a new type... donationFromSessions?
        //     message: 'Sessions flow: calling donations endpoint'
        // });
        // core.modules.analytics.sendAnalytics(event);

        makeSessionsDonationsCall(donationRequestData)
            .then((response: CheckoutSessionDonationsResponse) => {
                console.log('### DonationCampaignProvider::makeSessionsDonationsCall:: response', response);
                if (response.resultCode === 'Authorised') {
                    component.setStatus('success');
                } else {
                    component.setStatus('error');
                }
            })
            .catch((error: unknown) => {
                console.log('### DonationCampaignProvider::makeSessionsDonationsCall:: error', error);
            });
    };

    const makeSessionsDonationsCall = async (donationRequestData: CheckoutSessionDonationsRequestData): Promise<CheckoutSessionDonationsResponse> => {
        try {
            return await core.session.donations(donationRequestData);
        } catch (error: unknown) {
            // TODO - analytics?

            return Promise.reject(error);
        }
    };
};
