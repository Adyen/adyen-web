import { httpPost } from '../http';
import Session from '../../CheckoutSession';
import { CheckoutSessionOrdersResponse } from '../../CheckoutSession/types';
import { API_VERSION } from './constants';
import { Order } from '../../../types/global-types';

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
