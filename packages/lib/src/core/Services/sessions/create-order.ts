import { httpPost } from '../http';
import Session from '../../CheckoutSession';
import { CheckoutSessionOrdersResponse } from '../../CheckoutSession/types';
import { API_VERSION } from './constants';

/**
 */
function createOrder(session: Session): Promise<CheckoutSessionOrdersResponse> {
    const path = `${API_VERSION}/sessions/${session.id}/orders?clientKey=${session.clientKey}`;
    const data = {
        sessionData: session.data
    };

    return httpPost({ loadingContext: session.loadingContext, path, errorLevel: 'fatal' }, data);
}

export default createOrder;
