import { httpPost } from './http';
import { OrderStatus } from '../../types/global-types';

/**
 */
function orderStatus(config, order): Promise<OrderStatus> {
    const options = { path: `v1/order/status?clientKey=${config.clientKey}`, loadingContext: config.loadingContext };

    return httpPost(options, { orderData: order.orderData });
}

export default orderStatus;
