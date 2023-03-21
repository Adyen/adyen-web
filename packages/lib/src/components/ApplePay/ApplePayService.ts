import { OnAuthorizedCallback } from './types';

interface ApplePayServiceOptions {
    version: number;
    onValidateMerchant: (resolve, reject, url) => void;
    onCancel?: (event: ApplePayJS.Event) => void;
    onPaymentMethodSelected?: (resolve, reject, event: ApplePayJS.ApplePayPaymentMethodSelectedEvent) => void;
    onShippingMethodSelected?: (resolve, reject, event: ApplePayJS.ApplePayShippingMethodSelectedEvent) => void;
    onShippingContactSelected?: (resolve, reject, event: ApplePayJS.ApplePayShippingContactSelectedEvent) => void;
    onPaymentAuthorized?: OnAuthorizedCallback;
}

class ApplePayService {
    private session: ApplePaySession;

    constructor(paymentRequest: ApplePayJS.ApplePayPaymentRequest, options: ApplePayServiceOptions) {
        console.log('#Lib ApplePayService - paymentRequest', paymentRequest);
        console.log(options.version);

        this.session = new ApplePaySession(options.version, paymentRequest);
        this.session.onvalidatemerchant = event => this.onvalidatemerchant(event, options.onValidateMerchant);
        this.session.onpaymentauthorized = event => this.onpaymentauthorized(event, options.onPaymentAuthorized);
        this.session.oncancel = event => this.oncancel(event, options.onCancel);

        if (typeof options.onPaymentMethodSelected === 'function') {
            this.session.onpaymentmethodselected = event => this.onpaymentmethodselected(event, options.onPaymentMethodSelected);
        }

        if (typeof options.onShippingContactSelected === 'function') {
            this.session.onshippingcontactselected = event => this.onshippingcontactselected(event, options.onShippingContactSelected);
        }

        if (typeof options.onShippingMethodSelected === 'function') {
            this.session.onshippingmethodselected = event => this.onshippingmethodselected(event, options.onShippingMethodSelected);
        }
    }

    /**
     * Begins the merchant validation process.
     * When this method is called, the payment sheet is presented and the merchant validation process is initiated.
     * @see {@link https://developer.apple.com/documentation/apple_pay_on_the_web/applepaysession/1778001-begin}
     */
    begin() {
        return this.session.begin();
    }

    /**
     * An event handler that is called when the payment sheet is displayed.
     * Use this attribute to request and return a merchant session.
     * @param event - An ApplePayValidateMerchantEvent object (contains validationURL)
     * @param onValidateMerchant - A promise implemented by the merchant that will resolve with the merchantSession
     * @see {@link https://developer.apple.com/documentation/apple_pay_on_the_web/apple_pay_js_api/providing_merchant_validation}
     */
    onvalidatemerchant(event: ApplePayJS.ApplePayValidateMerchantEvent, onValidateMerchant) {
        new Promise((resolve, reject) => onValidateMerchant(resolve, reject, event.validationURL))
            .then(response => {
                this.session.completeMerchantValidation(response);
            })
            .catch(error => {
                console.error(error);
                this.session.abort();
            });
    }

    /**
     * An event handler that is called when the user has authorized the Apple Pay payment with Touch ID, Face ID, or passcode.
     * The onpaymentauthorized function must complete the payment and respond by calling completePayment before the 30 second timeout.
     *
     * @param event - The event parameter contains the payment (ApplePayPayment) attribute.
     * @param onPaymentAuthorized - A promise that will complete the payment when resolved. Use this promise to process the payment.
     * @see {@link https://developer.apple.com/documentation/apple_pay_on_the_web/applepaysession/1778020-onpaymentauthorized}
     */
    onpaymentauthorized(event: ApplePayJS.ApplePayPaymentAuthorizedEvent, onPaymentAuthorized: OnAuthorizedCallback): Promise<void> {
        return new Promise((resolve, reject) => onPaymentAuthorized(resolve, reject, event))
            .then((result: ApplePayJS.ApplePayPaymentAuthorizationResult) => {
                this.session.completePayment({
                    ...result,
                    status: result?.status ?? ApplePaySession.STATUS_SUCCESS
                });
            })
            .catch((result?: ApplePayJS.ApplePayPaymentAuthorizationResult) => {
                this.session.completePayment({
                    ...result,
                    status: result?.status ?? ApplePaySession.STATUS_FAILURE
                });
            });
    }

    /**
     * An event handler that is called when a new payment method is selected.
     * The onpaymentmethodselected function must resolve before the 30 second timeout
     * @param event - The event parameter contains the payment (ApplePayPayment) attribute.
     * @param onPaymentMethodSelected - A promise that will complete the payment when resolved. Use this promise to process the payment.
     * @see {@link https://developer.apple.com/documentation/apple_pay_on_the_web/applepaysession/1778013-onpaymentmethodselected}
     */
    onpaymentmethodselected(event: ApplePayJS.ApplePayPaymentMethodSelectedEvent, onPaymentMethodSelected) {
        return new Promise((resolve, reject) => onPaymentMethodSelected(resolve, reject, event))
            .then((paymentMethodUpdate: ApplePayJS.ApplePayPaymentMethodUpdate) => {
                this.session.completePaymentMethodSelection(paymentMethodUpdate);
            })
            .catch((paymentMethodUpdate: ApplePayJS.ApplePayPaymentMethodUpdate) => {
                this.session.completePaymentMethodSelection(paymentMethodUpdate);
            });
    }

    /**
     * An event handler that is called when a new payment method is selected.
     * The onpaymentmethodselected function must resolve before the 30 second timeout
     * @param event - The event parameter contains the shippingContact attribute.
     * @param onShippingContactSelected - A promise that will complete the selection of a shipping contact with an update.
     * @see {@link https://developer.apple.com/documentation/apple_pay_on_the_web/applepaysession/1778009-onshippingcontactselected}
     */
    onshippingcontactselected(event: ApplePayJS.ApplePayShippingContactSelectedEvent, onShippingContactSelected) {
        return new Promise((resolve, reject) => onShippingContactSelected(resolve, reject, event))
            .then((shippingContactUpdate: ApplePayJS.ApplePayShippingContactUpdate) => {
                this.session.completeShippingContactSelection(shippingContactUpdate);
            })
            .catch((shippingContactUpdate: ApplePayJS.ApplePayShippingContactUpdate) => {
                this.session.completeShippingContactSelection(shippingContactUpdate);
            });
    }

    /**
     * An event handler that is called when a new payment method is selected.
     * The onpaymentmethodselected function must resolve before the 30 second timeout
     * @param event - The event parameter contains the shippingMethod attribute.
     * @param onShippingMethodSelected - A promise that will complete the selection of a shipping method with an update.
     * @see {@link https://developer.apple.com/documentation/apple_pay_on_the_web/applepaysession/1778009-onshippingcontactselected}
     */
    onshippingmethodselected(event: ApplePayJS.ApplePayShippingMethodSelectedEvent, onShippingMethodSelected) {
        return new Promise((resolve, reject) => onShippingMethodSelected(resolve, reject, event))
            .then((shippingMethodUpdate: ApplePayJS.ApplePayShippingMethodUpdate) => {
                this.session.completeShippingMethodSelection(shippingMethodUpdate);
            })
            .catch((shippingMethodUpdate: ApplePayJS.ApplePayShippingMethodUpdate) => {
                this.session.completeShippingMethodSelection(shippingMethodUpdate);
            });
    }

    /**
     * An event handler that is automatically called when the payment UI is dismissed.
     * This function can be called even after an onpaymentauthorized event has been dispatched.
     * @param event -
     * @param onCancel -
     * @see {@link https://developer.apple.com/documentation/apple_pay_on_the_web/applepaysession/1778029-oncancel}
     */
    oncancel(event: ApplePayJS.Event, onCancel) {
        return onCancel(event);
    }
}

export default ApplePayService;
