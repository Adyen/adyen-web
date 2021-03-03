import { httpPost } from './http';

/**
 */
function makePayment(paymentData, session, { clientKey, loadingContext }): Promise<any> {
    const path = `v1/sessions/${session.id}/payments?clientKey=${clientKey}`;
    const data = {
        sessionData: session.data,
        ...paymentData
    };

    return httpPost({ loadingContext, path }, data);
}

export default makePayment;
