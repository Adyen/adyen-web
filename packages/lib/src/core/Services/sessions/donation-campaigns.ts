import { httpPost } from '../http';
import Session from '../../CheckoutSession';
import { API_ERROR_CODE, API_VERSION } from './constants';
import { CheckoutSessionDonationCampaignsResponse } from '../../CheckoutSession/types';

/**
 */
// function donationCampaigns(details, session: Session): Promise<CheckoutSessionDonationCampaignsResponse> {
function donationCampaigns(session: Session): Promise<CheckoutSessionDonationCampaignsResponse> {
    const path = `${API_VERSION}/sessions/${session.id}/donationCampaigns?clientKey=${session.clientKey}`;
    const data = {
        ...(session.data && { sessionData: session.data })
        // ...details
    };

    return httpPost({ loadingContext: session.loadingContext, path, errorLevel: 'fatal', errorCode: API_ERROR_CODE.submitPaymentDetails }, data);
}

export default donationCampaigns;
