import { CheckoutSession } from '../../types';
import makePayment from '../Services/makePayment';
import submitDetails from '../Services/submitDetails';

class Session {
    private session: CheckoutSession;
    clientKey: any;
    loadingContext: any;

    constructor(session, clientKey, loadingContext) {
        this.session = session;
        this.clientKey = clientKey;
        this.loadingContext = loadingContext;
    }

    get id() {
        return this.session.id;
    }

    get data() {
        return this.session.data;
    }

    updateSessionData(latestData: string) {
        this.session.data = latestData;
    }

    makePayment(data) {
        return makePayment(data, this);
    }

    submitDetails(data) {
        return submitDetails(data, this);
    }
}
export default Session;
