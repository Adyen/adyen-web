import { httpPost } from '../http';
import Session from '../../CheckoutSession';
import { CheckoutSessionOrdersResponse } from '../../../types';

/**
 */
function createOrder(session: Session): Promise<CheckoutSessionOrdersResponse> {
    const path = `v1/sessions/${session.id}/orders?clientKey=${session.clientKey}`;
    const data = {
        sessionData: session.data
    };

    return httpPost({ loadingContext: session.loadingContext, path, errorLevel: 'fatal' }, data);
}

export default createOrder;
