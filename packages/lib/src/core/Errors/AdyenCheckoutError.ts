const errorTypes = {
    submitPayment: 'AdyenCheckoutSubmitPaymentError',

    googlePay: 'AdyenCheckoutGooglePayAPIError',

    /** Network error */
    network: 'AdyenCheckoutNetworkError',

    /** Generic error */
    error: 'AdyenCheckoutError'
} as const;

type AdyenCheckoutErrorType = keyof typeof errorTypes;

class AdyenCheckoutError extends Error {
    constructor(type: AdyenCheckoutErrorType, message: string) {
        super(message);

        this.name = errorTypes[type];
    }
}

export default AdyenCheckoutError;
