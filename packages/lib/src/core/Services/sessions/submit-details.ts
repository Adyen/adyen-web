import { httpPost } from '../http';
import Session from '../../CheckoutSession';
import { API_VERSION } from './constants';
import { CheckoutSessionDetailsResponse } from '../../CheckoutSession/types';

/**
 */
function submitDetails(details, session: Session): Promise<CheckoutSessionDetailsResponse> {
    const path = `${API_VERSION}/sessions/${session.id}/paymentDetails?clientKey=${session.clientKey}`;
    const data = {
        sessionData: session.data,
        ...details
    };

    return httpPost({ loadingContext: session.loadingContext, path, errorLevel: 'fatal' }, data);
}

export default submitDetails;
