import makePayment from '../Services/sessions/make-payment';
import submitDetails from '../Services/sessions/submit-details';
import setupSession from '../Services/sessions/setup-session';
import checkBalance from '../Services/sessions/check-balance';
import Storage from '../../utils/Storage';
import createOrder from '../Services/sessions/create-order';
import {
    CheckoutSession,
    CheckoutSessionBalanceResponse,
    CheckoutSessionDetailsResponse,
    CheckoutSessionOrdersResponse,
    CheckoutSessionPaymentResponse,
    CheckoutSessionSetupResponse
} from '../../types';

class Session {
    private readonly session: CheckoutSession;
    private readonly storage: Storage;
    public readonly clientKey: string;
    public readonly loadingContext: string;

    constructor(session: CheckoutSession, clientKey: string, loadingContext: string) {
        if (!session.id) throw new Error('No Session ID');
        if (!clientKey) throw new Error('No clientKey available');

        this.storage = new Storage('session');
        this.clientKey = clientKey;
        this.loadingContext = loadingContext;
        this.session = session;

        if (!this.session.data) {
            this.session = this.getStoredSession();
        } else {
            this.storeSession();
        }
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
    updateSessionData(latestData: string): void {
        this.session.data = latestData;
        this.storeSession();
    }

    /**
     * Fetches data from a session
     */
    setupSession(): Promise<CheckoutSessionSetupResponse> {
        return setupSession(this);
    }

    /**
     * Submits a session payment
     */
    submitPayment(data): Promise<CheckoutSessionPaymentResponse> {
        return makePayment(data, this).then(response => {
            if (response.sessionData) {
                this.updateSessionData(response.sessionData);
            }

            return response;
        });
    }

    /**
     * Submits session payment additional details
     */
    submitDetails(data): Promise<CheckoutSessionDetailsResponse> {
        return submitDetails(data, this).then(response => {
            if (response.sessionData) {
                this.updateSessionData(response.sessionData);
            }

            return response;
        });
    }

    /**
     * Checks the balance for a payment method
     */
    checkBalance(data): Promise<CheckoutSessionBalanceResponse> {
        return checkBalance(data, this).then(response => {
            if (response.sessionData) {
                this.updateSessionData(response.sessionData);
            }

            return response;
        });
    }

    /**
     * Creates an order for the current session
     */
    createOrder(): Promise<CheckoutSessionOrdersResponse> {
        return createOrder(this).then(response => {
            if (response.sessionData) {
                this.updateSessionData(response.sessionData);
            }

            return response;
        });
    }

    /**
     * Gets the stored session but only if the current id and the stored id match
     */
    getStoredSession(): CheckoutSession {
        const storedSession = this.storage.get();
        return this.id === storedSession?.id ? storedSession : this.session;
    }

    /**
     * Stores the session
     */
    storeSession(): void {
        this.storage.set({ id: this.session.id, data: this.session.data });
    }

    /**
     * Clears the stored session
     */
    removeStoredSession(): void {
        this.storage.remove();
    }
}

export default Session;
