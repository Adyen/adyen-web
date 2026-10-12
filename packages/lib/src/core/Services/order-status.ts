import { httpPost } from './http';
import { OrderStatus } from '../../types/global-types';

/**
 */
function orderStatus(config, order): Promise<OrderStatus> {
    const options = { path: `v1/order/status?clientKey=${config.clientKey}`, loadingContext: config.loadingContext };

    console.log('[DEBUG giftcard-reload] /order/status request', { orderData: order.orderData?.slice(-16), pspReference: order.pspReference });

    return httpPost<OrderStatus>(options, { orderData: order.orderData }).then(response => {
        console.log('[DEBUG giftcard-reload] /order/status response', response);
        return response;
    });
}

export default orderStatus;
