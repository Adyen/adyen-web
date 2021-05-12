import { httpPost } from '../http';
import Session from '../../CheckoutSession';
import { CheckoutSessionSetupResponse } from '../../../types';

/**
 */
function setupSession(session: Session): Promise<CheckoutSessionSetupResponse> {
    const path = `v1/sessions/${session.id}/setup?clientKey=${session.clientKey}`;
    const data = {
        sessionData: session.data
    };

    return httpPost({ loadingContext: session.loadingContext, path, errorLevel: 'fatal' }, data);
}

export default setupSession;
