interface CheckoutErrorOptions {
    cause?: any;
    code?: string;
}

export const NETWORK_ERROR = 'NETWORK_ERROR';
export const CANCEL = 'CANCEL';
export const IMPLEMENTATION_ERROR = 'IMPLEMENTATION_ERROR';
export const API_ERROR = 'API_ERROR';
export const ERROR = 'ERROR';
export const SCRIPT_ERROR = 'SCRIPT_ERROR';
export const SDK_ERROR = 'SDK_ERROR';

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
        ERROR,

        /** Script error. The browser failed to load 3rd party script */
        SCRIPT_ERROR,

        /** Something has gone wrong internally */
        SDK_ERROR
    };

    public cause: unknown;
    public options: CheckoutErrorOptions;

    constructor(type: keyof typeof AdyenCheckoutError.errorTypes, message?: string, options?: CheckoutErrorOptions) {
        super(message);

        this.name = AdyenCheckoutError.errorTypes[type];
        this.options = options || {};
        this.cause = this.options.cause;
    }
}

export default AdyenCheckoutError;
