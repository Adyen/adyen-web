import fetchJsonData from '../../utils/fetch-json-data';
import { OrderStatus } from '../../types';

/**
 */
export function orderStatus(config, order): Promise<OrderStatus> {
    const options = { path: `/v1/order/status?token=${config.clientKey}`, loadingContext: config.loadingContext, method: 'POST' };

    return fetchJsonData(options, { orderData: order.orderData });
}

export default orderStatus;
