import { httpPost } from '../http';
import Session from '../../CheckoutSession';
import { CheckoutSessionSetupResponse } from '../../CheckoutSession/types';
import { API_VERSION } from './constants';

function setupSession(session: Session, options): Promise<CheckoutSessionSetupResponse> {
    const path = `${API_VERSION}/sessions/${session.id}/setup?clientKey=${session.clientKey}`;
    const data = {
        sessionData: session.data,
        ...(options.order
            ? {
                  order: { orderData: options.order.orderData, pspReference: options.order.pspReference }
              }
            : {})
    };

    return httpPost<CheckoutSessionSetupResponse>(
        {
            loadingContext: session.loadingContext,
            path,
            errorLevel: 'fatal'
        },
        data
    );
}

export default setupSession;
