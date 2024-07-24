import { httpPost } from '../http';
import Session from '../../CheckoutSession';
import { CheckoutSessionBalanceResponse } from '../../CheckoutSession/types';
import { API_VERSION } from './constants';

/**
 */
function checkBalance(paymentRequest, session: Session): Promise<CheckoutSessionBalanceResponse> {
    const path = `${API_VERSION}/sessions/${session.id}/paymentMethodBalance?clientKey=${session.clientKey}`;
    const data = {
        sessionData: session.data,
        ...paymentRequest
    };

    return httpPost({ loadingContext: session.loadingContext, path, errorLevel: 'fatal' }, data);
}

export default checkBalance;
