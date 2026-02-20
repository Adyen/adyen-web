import { httpPost } from '../http';
import Session from '../../CheckoutSession';
import { API_ERROR_CODE, API_VERSION } from './constants';
import { CheckoutSessionDonationsRequestData, CheckoutSessionDonationsResponse } from '../../CheckoutSession/types';

/**
 */
function donations(details: CheckoutSessionDonationsRequestData, session: Session): Promise<CheckoutSessionDonationsResponse> {
    const path = `${API_VERSION}/sessions/${session.id}/donations?clientKey=${session.clientKey}`;
    const data = {
        ...(session.data && { sessionData: session.data }),
        ...details
    };

    return httpPost({ loadingContext: session.loadingContext, path, errorLevel: 'fatal', errorCode: API_ERROR_CODE.submitPaymentDetails }, data);
}

export default donations;
