import { httpPost } from './http';
import Session from '../CheckoutSession';

/**
 */
function submitDetails(details, session: Session): Promise<any> {
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
