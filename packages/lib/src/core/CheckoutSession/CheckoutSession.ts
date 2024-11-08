import makePayment from '../Services/sessions/make-payment';
import submitDetails from '../Services/sessions/submit-details';
import setupSession from '../Services/sessions/setup-session';
import checkBalance from '../Services/sessions/check-balance';
import Storage from '../../utils/Storage';
import createOrder from '../Services/sessions/create-order';
import { sanitizeSession } from './utils';
import {
    CheckoutSession,
    CheckoutSessionBalanceResponse,
    CheckoutSessionDetailsResponse,
    CheckoutSessionOrdersResponse,
    CheckoutSessionPaymentResponse,
    CheckoutSessionSetupResponse,
    SessionConfiguration,
    SetupSessionOptions
} from './types';
import cancelOrder from '../Services/sessions/cancel-order';
import { onOrderCancelData } from '../../components/Dropin/types';
import type { AdditionalDetailsData } from '../types';
import collectBrowserInfo from '../../utils/browserInfo';

class Session {
    private readonly session: CheckoutSession;
    private readonly storage: Storage<CheckoutSession>;
    public readonly clientKey: string;
    public readonly loadingContext: string;
    public configuration: SessionConfiguration;

    constructor(rawSession: Partial<CheckoutSession>, clientKey: string, loadingContext: string) {
        const session = sanitizeSession(rawSession) as CheckoutSession;

        if (!clientKey) throw new Error('No clientKey available');
        if (!loadingContext) throw new Error('No loadingContext available');

        this.storage = new Storage('session', 'localStorage');
        this.clientKey = clientKey;
        this.loadingContext = loadingContext;
        this.session = session;

        if (!this.session.sessionData) {
            this.session = this.getStoredSession();
        } else {
            this.storeSession();
        }
    }

    get shopperLocale() {
        return this.session.shopperLocale;
    }

    get id() {
        return this.session.id;
    }

    get data() {
        return this.session.sessionData;
    }

    /**
     * Updates the session.data with the latest data blob
     */
    private updateSessionData(latestData: string): void {
        this.session.sessionData = latestData;
        this.storeSession();
    }

    /**
     * Fetches data from a session
     */
    setupSession(options: SetupSessionOptions): Promise<CheckoutSessionSetupResponse> {
        const mergedOptions = { ...options, browserInfo: collectBrowserInfo() };
        return setupSession(this, mergedOptions).then(response => {
            if (response.configuration) {
                this.configuration = { ...response.configuration };
            }

            if (response.sessionData) {
                this.updateSessionData(response.sessionData);
            }

            return response;
        });
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
    submitDetails(data: AdditionalDetailsData['data']): Promise<CheckoutSessionDetailsResponse> {
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
     * Cancels an order for the current session
     */
    cancelOrder(data: onOrderCancelData): Promise<CheckoutSessionOrdersResponse> {
        return cancelOrder(data.order, this).then(response => {
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
        this.storage.set({ id: this.session.id, sessionData: this.session.sessionData });
    }

    /**
     * Clears the stored session
     */
    removeStoredSession(): void {
        this.storage.remove();
    }
}

export default Session;
