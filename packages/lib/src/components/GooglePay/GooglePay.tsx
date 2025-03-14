import { h } from 'preact';
import UIElement from '../internal/UIElement/UIElement';
import GooglePayService from './GooglePayService';
import GooglePayButton from './components/GooglePayButton';
import defaultProps from './defaultProps';
import { formatGooglePayContactToAdyenAddressFormat, getGooglePayLocale } from './utils';
import collectBrowserInfo from '../../utils/browserInfo';
import AdyenCheckoutError from '../../core/Errors/AdyenCheckoutError';
import { TxVariants } from '../tx-variants';
import { sanitizeResponse, verifyPaymentDidNotFail } from '../internal/UIElement/utils';
import { ANALYTICS_INSTANT_PAYMENT_BUTTON, ANALYTICS_SELECTED_STR } from '../../core/Analytics/constants';
import { SendAnalyticsObject } from '../../core/Analytics/types';

import type { AddressData, BrowserInfo, PaymentResponseData, RawPaymentResponse } from '../../types/global-types';
import type { GooglePayConfiguration } from './types';
import type { ICore } from '../../core/types';

class GooglePay extends UIElement<GooglePayConfiguration> {
    public static type = TxVariants.googlepay;
    public static txVariants = [TxVariants.googlepay, TxVariants.paywithgoogle];
    public static defaultProps = defaultProps;

    protected readonly googlePay;

    constructor(checkout: ICore, props?: GooglePayConfiguration) {
        super(checkout, props);
        this.handleAuthorization = this.handleAuthorization.bind(this);
        this.showGooglePayPaymentSheet = this.showGooglePayPaymentSheet.bind(this);

        const { isExpress, paymentDataCallbacks } = this.props;

        if (isExpress === false && paymentDataCallbacks?.onPaymentDataChanged) {
            throw new AdyenCheckoutError(
                'IMPLEMENTATION_ERROR',
                'GooglePay - You must set "isExpress" flag to "true" in order to use "onPaymentDataChanged" callback'
            );
        }

        if (!this.props.configuration.merchantId) {
            throw new AdyenCheckoutError(
                'IMPLEMENTATION_ERROR',
                'GooglePay - Missing merchantId. Please ensure that it is correctly configured in your customer area.'
            );
        }

        this.googlePay = new GooglePayService(this.props.environment, {
            ...(isExpress && paymentDataCallbacks?.onPaymentDataChanged && { onPaymentDataChanged: paymentDataCallbacks.onPaymentDataChanged }),
            onPaymentAuthorized: this.onPaymentAuthorized
        });
    }

    protected override formatProps(props): GooglePayConfiguration {
        const buttonSizeMode = props.buttonSizeMode ?? (props.isDropin ? 'fill' : 'static');
        const buttonLocale = getGooglePayLocale(props.buttonLocale ?? props.i18n?.locale);

        const callbackIntents: google.payments.api.CallbackIntent[] = [...props.callbackIntents, 'PAYMENT_AUTHORIZATION'];

        return {
            ...props,
            configuration: props.configuration,
            buttonSizeMode,
            buttonLocale,
            callbackIntents
        };
    }

    /**
     * Formats the component data output
     */
    protected override formatData() {
        const { googlePayCardNetwork, googlePayToken, billingAddress, deliveryAddress } = this.state;
        const { isExpress } = this.props;

        return {
            paymentMethod: {
                type: this.type,
                googlePayCardNetwork,
                googlePayToken,
                ...(isExpress && { subtype: 'express' })
            },
            browserInfo: this.browserInfo,
            origin: !!window && window.location.origin,
            ...(billingAddress && { billingAddress }),
            ...(deliveryAddress && { deliveryAddress })
        };
    }

    protected submitAnalytics(analyticsObj: SendAnalyticsObject) {
        // Analytics will need to know about this.props.isExpress & this.props.expressPage
        super.submitAnalytics({ ...analyticsObj }, this.props);
    }

    /**
     * Displays the Google Pay payment sheet overlay
     */
    private showGooglePayPaymentSheet() {
        this.googlePay.initiatePayment(this.props, this.core.options.countryCode).catch((error: google.payments.api.PaymentsError) => {
            // eslint-disable-next-line @typescript-eslint/no-base-to-string
            this.handleError(new AdyenCheckoutError(error.statusCode === 'CANCELED' ? 'CANCEL' : 'ERROR', error.toString(), { cause: error }));
        });
    }

    public override submit = () => {
        if (this.props.isInstantPayment) {
            this.submitAnalytics({ type: ANALYTICS_SELECTED_STR, target: ANALYTICS_INSTANT_PAYMENT_BUTTON });
        }

        new Promise<void>((resolve, reject) => this.props.onClick(resolve, reject)).then(this.showGooglePayPaymentSheet).catch(() => {
            // Swallow exception triggered by onClick reject
        });
    };

    /**
     * Method called when the payment is authorized in the payment sheet
     *
     * @see https://developers.google.com/pay/api/web/reference/client#onPaymentAuthorized
     **/
    private onPaymentAuthorized = async (paymentData: google.payments.api.PaymentData): Promise<google.payments.api.PaymentAuthorizationResult> => {
        const billingAddress: AddressData = formatGooglePayContactToAdyenAddressFormat(paymentData.paymentMethodData.info.billingAddress);
        const deliveryAddress: AddressData = formatGooglePayContactToAdyenAddressFormat(paymentData.shippingAddress, true);

        this.setState({
            authorizedEvent: paymentData,
            googlePayToken: paymentData.paymentMethodData.tokenizationData.token,
            googlePayCardNetwork: paymentData.paymentMethodData.info.cardNetwork,
            ...(billingAddress && { billingAddress }),
            ...(deliveryAddress && { deliveryAddress })
        });

        return new Promise<google.payments.api.PaymentAuthorizationResult>(resolve => {
            this.handleAuthorization()
                .then(this.makePaymentsCall)
                .then(sanitizeResponse)
                .then(verifyPaymentDidNotFail)
                .then((paymentResponse: PaymentResponseData) => {
                    resolve({ transactionState: 'SUCCESS' });
                    return paymentResponse;
                })
                .then(paymentResponse => {
                    this.handleResponse(paymentResponse);
                })
                .catch((paymentResponse?: RawPaymentResponse) => {
                    this.setElementStatus('ready');

                    const googlePayError = paymentResponse?.error?.googlePayError;
                    const fallbackMessage = this.props.i18n.get('error.subtitle.payment');

                    const error: google.payments.api.PaymentDataError =
                        typeof googlePayError === 'string' || undefined
                            ? {
                                  intent: 'PAYMENT_AUTHORIZATION',
                                  reason: 'OTHER_ERROR',
                                  message: (googlePayError as string) || fallbackMessage
                              }
                            : {
                                  intent: googlePayError?.intent || 'PAYMENT_AUTHORIZATION',
                                  reason: googlePayError?.reason || 'OTHER_ERROR',
                                  message: googlePayError?.message || fallbackMessage
                              };

                    resolve({
                        transactionState: 'ERROR',
                        error
                    });

                    const responseWithError = {
                        ...paymentResponse,
                        error: {
                            googlePayError: error
                        }
                    };

                    this.handleFailedResult(responseWithError);
                });
        });
    };

    /**
     * Call the 'onAuthorized' callback if available.
     * Must be resolved/reject for the payment flow to continue
     */
    private async handleAuthorization(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (!this.props.onAuthorized) {
                resolve();
            }

            const { authorizedEvent, billingAddress, deliveryAddress } = this.state;

            this.props.onAuthorized(
                {
                    authorizedEvent,
                    ...(billingAddress && { billingAddress }),
                    ...(deliveryAddress && { deliveryAddress })
                },
                { resolve, reject }
            );
        }).catch((error?: google.payments.api.PaymentDataError | string) => {
            // Format error in a way that the 'catch' of the 'onPaymentAuthorize' block accepts it
            const data = { error: { googlePayError: error } };
            return Promise.reject(data);
        });
    }

    /**
     * Validation
     */
    get isValid(): boolean {
        return !!this.state.googlePayToken;
    }

    /**
     * Determine a shopper's ability to return a form of payment from the Google Pay API.
     */
    public override async isAvailable(): Promise<void> {
        return this.isReadyToPay()
            .then(response => {
                if (!response.result) {
                    throw new AdyenCheckoutError('ERROR', 'GooglePay is not available');
                }

                if (response.paymentMethodPresent === false) {
                    throw new AdyenCheckoutError('ERROR', 'GooglePay - No paymentMethodPresent');
                }

                return Promise.resolve();
            })
            .catch(error => {
                return Promise.reject(error);
            });
    }

    /**
     * Determine a shopper's ability to return a form of payment from the Google Pay API.
     */
    public isReadyToPay = (): Promise<google.payments.api.IsReadyToPayResponse> => {
        return this.googlePay.isReadyToPay(this.props);
    };

    /**
     * Use this method to prefetch a PaymentDataRequest configuration to improve loadPaymentData execution time on later user interaction. No value is returned.
     */
    public prefetch = (): void => {
        return this.googlePay.prefetchPaymentData(this.props, this.core.options.countryCode);
    };

    get browserInfo(): BrowserInfo {
        return collectBrowserInfo();
    }

    get icon(): string {
        return this.props.icon ?? this.resources.getImage()('googlepay');
    }

    render() {
        if (this.props.showPayButton) {
            return (
                <GooglePayButton
                    buttonColor={this.props.buttonColor}
                    buttonType={this.props.buttonType}
                    buttonSizeMode={this.props.buttonSizeMode}
                    buttonLocale={this.props.buttonLocale}
                    buttonRootNode={this.props.buttonRootNode}
                    buttonRadius={this.props.buttonRadius}
                    paymentsClient={this.googlePay.paymentsClient}
                    onClick={this.submit}
                />
            );
        }

        return null;
    }
}

export default GooglePay;
