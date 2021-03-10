import { httpPost } from './http';
import Session from '../CheckoutSession';
import { CheckoutSessionDetailsResponse } from '../../types';

/**
 */
function submitDetails(details, session: Session): Promise<CheckoutSessionDetailsResponse> {
    const path = `v1/sessions/${session.id}/paymentDetails?clientKey=${session.clientKey}`;
    const data = {
        sessionData: session.data,
        details
    };

    return httpPost({ loadingContext: session.loadingContext, path }, data).then(response => {
        if (response.sessionData) {
            session.updateSessionData(response.sessionData);
        }

        return response;
    });
}

export default submitDetails;
