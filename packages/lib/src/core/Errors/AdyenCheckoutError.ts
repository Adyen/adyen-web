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

    constructor(type: keyof typeof AdyenCheckoutError.errorTypes, message?: string) {
        super(message);

        this.name = AdyenCheckoutError.errorTypes[type];
    }
}

export default AdyenCheckoutError;
