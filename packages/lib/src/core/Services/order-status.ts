import { httpGet } from './http';
import { OrderStatus } from '../../types';

/**
 */
function orderStatus(config, order): Promise<OrderStatus> {
    const options = { path: `/v1/order/status`, clientKey: config.clientKey, loadingContext: config.loadingContext };

    return httpGet(options, { orderData: order.orderData });
}

export default orderStatus;
