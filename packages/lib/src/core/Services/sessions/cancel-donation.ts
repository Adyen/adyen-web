import { httpPost } from '../http';
import Session from '../../CheckoutSession';
import { API_ERROR_CODE, API_VERSION } from './constants';
import { CheckoutSessionCancelDonationResponse } from '../../CheckoutSession/types';

function cancelDonation(session: Session): Promise<CheckoutSessionCancelDonationResponse> {
    const path = `${API_VERSION}/sessions/${session.id}/donations/cancel?clientKey=${session.clientKey}`;
    const data = {
        ...(session.data && { sessionData: session.data })
    };

    return httpPost({ loadingContext: session.loadingContext, path, errorLevel: 'fatal', errorCode: API_ERROR_CODE.cancelDonation }, data);
}

export default cancelDonation;
