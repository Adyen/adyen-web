interface CheckoutErrorOptions {
    cause?: any;
    code?: string;
}

export const NETWORK_ERROR = 'NETWORK_ERROR';
export const CANCEL = 'CANCEL';
export const IMPLEMENTATION_ERROR = 'IMPLEMENTATION_ERROR';
export const API_ERROR = 'API_ERROR'; // renamed to PAYMENT_ERROR
export const ERROR = 'ERROR';
export const SCRIPT_ERROR = 'SCRIPT_ERROR'; // renamed to THIRD_PARTY_SCRIPT_ERROR

export const THIRD_PARTY_SCRIPT_ERROR = 'THIRD_PARTY_SCRIPT_ERROR';
export const SDK_ERROR = 'SDK_ERROR'; // removed, only used once
export const PAYMENT_ERROR = 'PAYMENT_ERROR';
export const INTERNAL_CANCEL_ERROR = 'INTERNAL_CANCEL_ERROR';

// Technical errors - 4xx 5xx errors, cors errors cause api fails technically, cannot load 3rd party scripts

// Functional errors - the end of payment flows, e.g:wrong pin code. 3rd party sdks errors, CANCEL the payments, the api returns the 2xx but not contain the data we need so the payment flow breaks.

// Implementation errors - The method or parameter are incorrect or are not supported.

// Unknown errors - cannot be assigned to any other errors above

export class AdyenCheckoutError extends Error {
    protected static errorTypes = {
        /** Technical error? API calls give 4xx or 5xx errors, cors errors etc. 3rd party script fails to load*/
        NETWORK_ERROR,
        THIRD_PARTY_SCRIPT_ERROR,

        /** Implementation error. The method or parameter are incorrect or are not supported. */
        IMPLEMENTATION_ERROR,

        /** Functional errors */
        /** Third party related errors such as: shopper canceled the current transaction. Throws by 3rd parties sdk like ApplePay, CashAppPay, GooglePay etc.*/
        CANCEL,
        /** The API returns 2xx but has not returned the expected data */
        PAYMENT_ERROR,

        /** Generic error. */
        ERROR,
        INTERNAL_CANCEL_ERROR
    };

    public name: string;
    public options?: CheckoutErrorOptions;

    constructor(type: keyof typeof AdyenCheckoutError.errorTypes, message?: string, options?: CheckoutErrorOptions) {
        super(message);
        this.name = AdyenCheckoutError.errorTypes[type]; // the type of the error
        this.options = options;
    }
}

export class NetworkError extends AdyenCheckoutError {
    constructor(message?: string, options?: CheckoutErrorOptions) {
        super(NETWORK_ERROR, message, options);
    }
}
export class ImplementationError extends AdyenCheckoutError {}
export class ThirdPartyError extends AdyenCheckoutError {}
export class CancelError extends AdyenCheckoutError {}

export default AdyenCheckoutError;
