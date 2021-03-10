import { CheckoutSession } from '../../types';
import makePayment from '../Services/makePayment';
import submitDetails from '../Services/submitDetails';
import { getStoredSession, storeSession } from './storage';

class Session {
    private session: CheckoutSession;
    public clientKey: any;
    public loadingContext: any;

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

    /**
     * Updates the session.data with the latest data blob
     */
    updateSessionData(latestData: string) {
        this.session.data = latestData;
    }

    /**
     * Submits a session payment
     */
    makePayment(data) {
        return makePayment(data, this);
    }

    /**
     * Submits session payment additional details
     */
    submitDetails(data) {
        return submitDetails(data, this);
    }

    getStoredSession(sessionId) {
        const storedSession = getStoredSession();
        this.session = sessionId === storedSession.id ? storedSession : null;
    }

    storeSession() {
        storeSession(this.session);
    }
}
export default Session;
