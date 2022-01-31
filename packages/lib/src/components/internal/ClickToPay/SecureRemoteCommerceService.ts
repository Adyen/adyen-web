// interface ISRCi {
//     init(params: InitParams): Promise<void>;
// }

interface InitParams {
    srcInitiatorId: string;
    srciTransactionId: string;
    srciDpaId: string;
    dpaTransactionOptions: DpaTransactionOptions;
    dpaData?: DpaData;
}

export interface IdentityLookupParams {
    value: string;
    type: string;
}

interface DpaTransactionOptions {
    dpaAcceptedBillingCountries?: string[];
    dpaAcceptedShippingCountries?: string[];
    dpaBillingPreference?: string;
    dpaShippingPreference?: string;
    dpaLocale?: string;
    consumerNameRequested?: boolean;
    consumerEmailAddressRequested?: boolean;
    consumerPhoneNumberRequested?: boolean;
    checkoutDescription: string;
    paymentOptions?: PaymentOptions;
    reviewAction: string; // visa
    transactionType?: string; // Not supported by MC
    transactionAmount: TransactionAmount;
    orderType?: string; // visa
    isGuestCheckout?: boolean;
    payloadTypeIndicator: string; // visa
    payloadTypeIndicatorCheckout?: string; // Not supported by MC
    payloadTypeIndicatorPayload?: string; // Not supported by MC
    merchantOrderId: string; //visa
    merchantCategoryCode: string;
    merchantCountryCode: string;
    threeDSInputData?: ThreeDSInputData;
}

interface ThreeDSInputData {
    requestorId: string;
    acquirerId: string;
    acquirerMid: string;
}

interface TransactionAmount {
    transactionAmount: number;
    transactionCurrencyCode: string;
}

interface PaymentOptions {
    // Visa
    dpaPanRequested?: string;
    // Mastercard docs
    dpaDynamicDataTTLMinutes?: string; // Not supported by MC
    dynamicDataType?: string;
}

interface DpaData {
    srcdpaId: string; // might not be needed
    dpaPresentationName?: string;
    dpaUri: string;
    dpaThreeDsPreference: 'ONBEHALF' | 'SELF' | 'NONE' | 'UNKNOWN';
}

export interface ISecureRemoteCommerceService {
    init(params: InitParams): Promise<void>;
    isRecognized(): Promise<IsRecognized>;
    identityLookup(params: IdentityLookupParams): Promise<IdentityLookupResponse>;
}

export type IdentityLookupResponse = {
    consumerPresent: boolean;
};

type IsRecognized = {
    recognized: boolean;
    idTokens?: string[];
};

export default abstract class SecureRemoteCommerceInitiator implements ISecureRemoteCommerceService {
    public schemaSdk: any;

    /**
     * Initializes the app with common state. The init method must be called before any other methods. It
     * is synchronous in operation.
     */
    public async init(params: InitParams): Promise<void> {
        try {
            const response = await this.schemaSdk.init(params);
            return response;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    /**
     * Determines whether the consumer is recognized, e.g. by detecting the presence of a local cookie in
     * the browser environment.
     */
    public async isRecognized(): Promise<IsRecognized> {
        try {
            const response = await this.schemaSdk.isRecognized();
            return response;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    /**
     * Obtains the user account associated with the consumer’s identity (an email address or phone
     * number).
     */
    public abstract identityLookup(params: IdentityLookupParams): Promise<IdentityLookupResponse>;
}
