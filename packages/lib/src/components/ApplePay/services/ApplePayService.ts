import { ApplePayConfiguration, ApplePayPaymentAuthorizationResult } from '../types';

export interface ApplePayServiceOptions {
    version: number;
    onError: (error?: unknown) => void;
    onCancel?: (event: ApplePayJS.Event) => void;
    onValidateMerchant: ApplePayConfiguration['onValidateMerchant'];
    onCouponCodeChanged?: ApplePayConfiguration['onCouponCodeChanged'];
    onPaymentMethodSelected?: ApplePayConfiguration['onPaymentMethodSelected'];
    onShippingMethodSelected?: ApplePayConfiguration['onShippingMethodSelected'];
    onShippingContactSelected?: ApplePayConfiguration['onShippingContactSelected'];
    onPaymentAuthorized: (
        resolve: (result: ApplePayPaymentAuthorizationResult) => void,
        reject: (result: ApplePayPaymentAuthorizationResult) => void,
        event: ApplePayJS.ApplePayPaymentAuthorizedEvent
    ) => void;
}

class ApplePayService {
    private session: ApplePaySession;
    private readonly options: ApplePayServiceOptions;

    constructor(paymentRequest: ApplePayJS.ApplePayPaymentRequest, options: ApplePayServiceOptions) {
        this.options = options;

        this.session = new ApplePaySession(options.version, paymentRequest);
        this.session.onvalidatemerchant = event => {
            void this.onvalidatemerchant(event, options.onValidateMerchant);
        };
        this.session.onpaymentauthorized = event => {
            void this.onpaymentauthorized(event, options.onPaymentAuthorized);
        };

        this.session.oncancel = event => {
            this.oncancel(event, options.onCancel);
        };

        if (typeof options.onPaymentMethodSelected === 'function') {
            this.session.onpaymentmethodselected = event => {
                void this.onpaymentmethodselected(event, options.onPaymentMethodSelected);
            };
        }

        if (typeof options.onShippingContactSelected === 'function') {
            this.session.onshippingcontactselected = event => {
                void this.onshippingcontactselected(event, options.onShippingContactSelected);
            };
        }

        if (typeof options.onShippingMethodSelected === 'function') {
            this.session.onshippingmethodselected = event => {
                void this.onshippingmethodselected(event, options.onShippingMethodSelected);
            };
        }

        if (typeof options.onCouponCodeChanged === 'function') {
            this.session.oncouponcodechanged = event => {
                void this.oncouponcodechanged(event, options.onCouponCodeChanged);
            };
        }
    }

    /**
     * Begins the merchant validation process.
     * When this method is called, the payment sheet is presented and the merchant validation process is initiated.
     * @see {@link https://developer.apple.com/documentation/applepayontheweb/applepaysession/begin}
     */
    begin() {
        return this.session.begin();
    }

    /**
     * An event handler that is called when the payment sheet is displayed.
     * Use this attribute to request and return a merchant session.
     * @param event - An ApplePayValidateMerchantEvent object (contains validationURL)
     * @param onValidateMerchant - A function implemented by the merchant that will resolve with the merchantSession
     * @see {@link https://developer.apple.com/documentation/applepayontheweb/applepaysession/onvalidatemerchant}
     */
    onvalidatemerchant(event: ApplePayJS.ApplePayValidateMerchantEvent, onValidateMerchant: ApplePayConfiguration['onValidateMerchant']) {
        return new Promise<unknown>((resolve, reject) => {
            void onValidateMerchant(resolve, reject, event.validationURL);
        })
            .then(response => {
                this.session.completeMerchantValidation(response);
            })
            .catch(error => {
                console.error(error);
                this.session.abort();
                this.options.onError(error);
            });
    }

    /**
     * An event handler that is called when the user has authorized the Apple Pay payment with Touch ID, Face ID, or passcode.
     * The onpaymentauthorized function must complete the payment and respond by calling completePayment before the 30 second timeout.
     *
     * @param event - An ApplePayPaymentAuthorizedEvent object (contains payment).
     * @param onPaymentAuthorized - A function that will complete the payment when resolved. Use this promise to process the payment.
     * @see {@link https://developer.apple.com/documentation/applepayontheweb/applepaysession/onpaymentauthorized}
     */
    onpaymentauthorized(
        event: ApplePayJS.ApplePayPaymentAuthorizedEvent,
        onPaymentAuthorized: ApplePayServiceOptions['onPaymentAuthorized']
    ): Promise<void> {
        return new Promise((resolve, reject) => onPaymentAuthorized(resolve, reject, event))
            .then((result: ApplePayPaymentAuthorizationResult) => {
                this.session.completePayment(result);
            })
            .catch((result: ApplePayPaymentAuthorizationResult) => {
                this.session.completePayment(result);
            });
    }

    /**
     * An event handler that is called when a new payment method is selected.
     * The onpaymentmethodselected function must resolve before the 30 second timeout
     *
     * @param event - An ApplePayPaymentMethodSelectedEvent object (contains paymentMethod).
     * @param onPaymentMethodSelected - A function that will complete the payment when resolved. Use this promise to process the payment.
     * @see {@link https://developer.apple.com/documentation/applepayontheweb/applepaysession/onpaymentmethodselected}
     */
    onpaymentmethodselected(
        event: ApplePayJS.ApplePayPaymentMethodSelectedEvent,
        onPaymentMethodSelected: ApplePayServiceOptions['onPaymentMethodSelected']
    ) {
        return new Promise((resolve, reject) => onPaymentMethodSelected(resolve, reject, event))
            .then((paymentMethodUpdate: ApplePayJS.ApplePayPaymentMethodUpdate) => {
                this.session.completePaymentMethodSelection(paymentMethodUpdate);
            })
            .catch((paymentMethodUpdate: ApplePayJS.ApplePayPaymentMethodUpdate) => {
                this.session.completePaymentMethodSelection(paymentMethodUpdate);
            });
    }

    /**
     * An event handler that is called when a new shipping contact is selected.
     * The onshippingcontactselected function must resolve before the 30 second timeout
     * @param event - An ApplePayShippingContactSelectedEvent object (contains shippingContact).
     * @param onShippingContactSelected - A function that will complete the selection of a shipping contact with an update.
     * @see {@link https://developer.apple.com/documentation/applepayontheweb/applepaysession/onshippingcontactselected}
     */
    onshippingcontactselected(
        event: ApplePayJS.ApplePayShippingContactSelectedEvent,
        onShippingContactSelected: ApplePayConfiguration['onShippingContactSelected']
    ) {
        return new Promise((resolve, reject) => onShippingContactSelected(resolve, reject, event))
            .then((shippingContactUpdate: ApplePayJS.ApplePayShippingContactUpdate) => {
                this.session.completeShippingContactSelection(shippingContactUpdate);
            })
            .catch((shippingContactUpdate: ApplePayJS.ApplePayShippingContactUpdate) => {
                this.session.completeShippingContactSelection(shippingContactUpdate);
            });
    }

    /**
     * An event handler that is called when a new shipping method is selected.
     * The onshippingmethodselected function must resolve before the 30 second timeout
     * @param event - An ApplePayShippingMethodSelectedEvent object (contains shippingMethod).
     * @param onShippingMethodSelected - A function that will complete the selection of a shipping method with an update.
     * @see {@link https://developer.apple.com/documentation/applepayontheweb/applepaysession/onshippingmethodselected}
     */
    onshippingmethodselected(
        event: ApplePayJS.ApplePayShippingMethodSelectedEvent,
        onShippingMethodSelected: ApplePayConfiguration['onShippingMethodSelected']
    ) {
        return new Promise((resolve, reject) => onShippingMethodSelected(resolve, reject, event))
            .then((shippingMethodUpdate: ApplePayJS.ApplePayShippingMethodUpdate) => {
                this.session.completeShippingMethodSelection(shippingMethodUpdate);
            })
            .catch((shippingMethodUpdate: ApplePayJS.ApplePayShippingMethodUpdate) => {
                this.session.completeShippingMethodSelection(shippingMethodUpdate);
            });
    }

    /**
     * An event handler called by the system when the user enters or updates a coupon code.
     * The oncouponcodechanged function must resolve before the 30 second timeout
     * @param event - An ApplePayCouponCodeChangedEvent object (contains couponCode).
     * @param onCouponCodeChanged - A function that will complete the entry or update of a coupon code with an update.
     * @see {@link https://developer.apple.com/documentation/applepayontheweb/applepaysession/oncouponcodechanged}
     */
    oncouponcodechanged(event: ApplePayJS.ApplePayCouponCodeChangedEvent, onCouponCodeChanged: ApplePayConfiguration['onCouponCodeChanged']) {
        return new Promise((resolve, reject) => onCouponCodeChanged(resolve, reject, event))
            .then((couponCodeUpdate: ApplePayJS.ApplePayCouponCodeUpdate) => {
                this.session.completeCouponCodeChange(couponCodeUpdate);
            })
            .catch((couponCodeUpdate: ApplePayJS.ApplePayCouponCodeUpdate) => {
                this.session.completeCouponCodeChange(couponCodeUpdate);
            });
    }

    /**
     * An event handler that is automatically called when the payment UI is dismissed.
     * This function can be called even after an onpaymentauthorized event has been dispatched.
     * @param event - An ApplePayJS.Event object
     * @param onCancel - A function that will complete the cancellation of the payment.
     * @see {@link https://developer.apple.com/documentation/applepayontheweb/applepaysession/oncancel}
     */
    oncancel(event: ApplePayJS.Event, onCancel: (event: ApplePayJS.Event) => void): void {
        onCancel(event);
    }
}

export default ApplePayService;
