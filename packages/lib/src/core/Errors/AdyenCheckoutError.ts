interface CheckoutErrorOptions {
    cause?: any;
}

export const NETWORK_ERROR = 'NETWORK_ERROR';
export const CANCEL = 'CANCEL';
export const IMPLEMENTATION_ERROR = 'IMPLEMENTATION_ERROR';
export const API_ERROR = 'API_ERROR';
export const ERROR = 'ERROR';

class AdyenCheckoutError extends Error {
    protected static errorTypes = {
        /** Network error. */
        NETWORK_ERROR,

        /** Shopper canceled the current transaction. */
        CANCEL,

        /** Implementation error. The method or parameter are incorrect or are not supported. */
        IMPLEMENTATION_ERROR,

        /** API error. The API has not returned the expected data  */
        API_ERROR,

        /** Generic error. */
        ERROR
    };

    public cause: unknown;

    constructor(type: keyof typeof AdyenCheckoutError.errorTypes, message?: string, options?: CheckoutErrorOptions) {
        super(message);

        this.name = AdyenCheckoutError.errorTypes[type];

        this.cause = options?.cause;
    }
}

export default AdyenCheckoutError;
