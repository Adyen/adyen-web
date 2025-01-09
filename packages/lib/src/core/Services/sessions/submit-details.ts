import { httpPost } from '../http';
import Session from '../../CheckoutSession';
import { API_ERROR_CODE, API_VERSION } from './constants';
import { CheckoutSessionDetailsResponse } from '../../CheckoutSession/types';

/**
 */
function submitDetails(details, session: Session): Promise<CheckoutSessionDetailsResponse> {
    const path = `${API_VERSION}/sessions/${session.id}/paymentDetails?clientKey=${session.clientKey}`;
    const data = {
        sessionData: session.data,
        ...details
    };

    return httpPost({ loadingContext: session.loadingContext, path, errorLevel: 'fatal', errorCode: API_ERROR_CODE.submitPaymentDetails }, data);
}

export default submitDetails;
