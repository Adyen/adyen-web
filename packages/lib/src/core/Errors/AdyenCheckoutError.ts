const genericErrorTypes = {
    submitPayment: 'AdyenCheckoutSubmitPaymentError',

    /** Network error */
    network: 'AdyenCheckoutNetworkError',

    /** Generic error */
    error: 'AdyenCheckoutError'
} as { [key: string]: string };

class AdyenCheckoutError<T extends typeof genericErrorTypes = typeof genericErrorTypes> extends Error {
    protected errorTypes: T = genericErrorTypes as T;

    constructor(type: keyof T, message: string) {
        super(message);

        this.name = this.errorTypes[type];
    }
}

export default AdyenCheckoutError;
