import AdyenCheckoutError from '../../core/Errors/AdyenCheckoutError';

const googlePayErrors = {
    googlePay: 'AdyenCheckoutGooglePayAPIError'
};

class AdyenCheckoutGooglePayError extends AdyenCheckoutError<typeof googlePayErrors> {
    errorTypes = googlePayErrors;
    statusCode: string;

    constructor(type, message, statusCode: google.payments.api.PaymentsErrorStatusCode) {
        super(type, message);
        this.statusCode = statusCode;
    }
}

export default AdyenCheckoutGooglePayError;
