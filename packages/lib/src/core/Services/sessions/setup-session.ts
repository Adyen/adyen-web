import { httpPost } from '../http';
import Session from '../../CheckoutSession';
import { CheckoutSessionSetupResponse, SetupSessionOptions } from '../../CheckoutSession/types';
import { API_VERSION } from './constants';

function setupSession(session: Session, options: SetupSessionOptions): Promise<CheckoutSessionSetupResponse> {
    const path = `${API_VERSION}/sessions/${session.id}/setup?clientKey=${session.clientKey}`;
    const data = {
        browserInfo: options.browserInfo,
        sessionData: session.data,
        ...(options.order
            ? {
                  order: { orderData: options.order.orderData, pspReference: options.order.pspReference }
              }
            : {})
    };

    console.log('[DEBUG giftcard-reload] /setup request', {
        sessionId: session.id,
        sessionDataTail: session.data?.slice(-16),
        orderSent: data.order
    });

    return httpPost<CheckoutSessionSetupResponse>(
        {
            loadingContext: session.loadingContext,
            path,
            errorLevel: 'fatal'
        },
        data
    ).then(response => {
        console.log('[DEBUG giftcard-reload] /setup response', {
            responseKeys: JSON.stringify(Object.keys(response)),
            order: (response as { order?: unknown }).order,
            amount: JSON.stringify(response.amount),
            sessionDataTail: response.sessionData?.slice(-16),
            hasPaymentMethods: !!response.paymentMethods
        });
        return response;
    });
}

export default setupSession;
