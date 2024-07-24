import { httpPost } from '../http';
import Session from '../../CheckoutSession';
import { CheckoutSessionPaymentResponse } from '../../CheckoutSession/types';
import { API_VERSION } from './constants';

/**
 */
function makePayment(paymentRequest, session: Session): Promise<CheckoutSessionPaymentResponse> {
    const path = `${API_VERSION}/sessions/${session.id}/payments?clientKey=${session.clientKey}`;
    const data = {
        sessionData: session.data,
        ...paymentRequest
    };

    return httpPost({ loadingContext: session.loadingContext, path, errorLevel: 'fatal' }, data);
}

export default makePayment;
