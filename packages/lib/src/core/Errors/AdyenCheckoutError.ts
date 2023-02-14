interface CheckoutErrorOptions {
    cause: any;
}

class AdyenCheckoutError extends Error {
    protected static errorTypes = {
        /** Network error. */
        NETWORK_ERROR: 'NETWORK_ERROR',

        /** Shopper canceled the current transaction. */
        CANCEL: 'CANCEL',

        /** Implementation error. The method or parameter are incorrect or are not supported. */
        IMPLEMENTATION_ERROR: 'IMPLEMENTATION_ERROR',

        /** Generic error. */
        ERROR: 'ERROR'
    };

    public cause: unknown;

    constructor(type: keyof typeof AdyenCheckoutError.errorTypes, message?: string, options?: CheckoutErrorOptions) {
        super(message);

        this.name = AdyenCheckoutError.errorTypes[type];

        this.cause = options?.cause;
    }
}

export default AdyenCheckoutError;
