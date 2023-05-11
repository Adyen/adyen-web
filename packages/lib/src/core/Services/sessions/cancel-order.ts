import { httpPost } from '../http';
import Session from '../../CheckoutSession';
import { CheckoutSessionOrdersResponse, Order } from '../../../types';
import { API_VERSION } from './constants';

/**
 */
function cancelOrder(order: Order, session: Session): Promise<CheckoutSessionOrdersResponse> {
    const path = `${API_VERSION}/sessions/${session.id}/orders/cancel?clientKey=${session.clientKey}`;

    const data = {
        sessionData: session.data,
        order: order
    };

    return httpPost({ loadingContext: session.loadingContext, path, errorLevel: 'fatal' }, data);
}

export default cancelOrder;
