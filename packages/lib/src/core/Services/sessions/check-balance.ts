import { httpPost } from '../http';
import Session from '../../CheckoutSession';
import { CheckoutSessionBalanceResponse } from '../../../types';

/**
 */
function checkBalance(paymentRequest, session: Session): Promise<CheckoutSessionBalanceResponse> {
    const path = `v1/sessions/${session.id}/paymentMethodBalance?clientKey=${session.clientKey}`;
    const data = {
        sessionData: session.data,
        ...paymentRequest
    };

    return httpPost({ loadingContext: session.loadingContext, path, errorLevel: 'fatal' }, data);
}

export default checkBalance;
