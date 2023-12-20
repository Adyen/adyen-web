import { h } from 'preact';
import UIElement from '../internal/UIElement/UIElement';
import GooglePayService from './GooglePayService';
import GooglePayButton from './components/GooglePayButton';
import defaultProps from './defaultProps';
import { GooglePayConfiguration } from './types';
import { formatGooglePayContactToAdyenAddressFormat, getGooglePayLocale } from './utils';
import collectBrowserInfo from '../../utils/browserInfo';
import AdyenCheckoutError from '../../core/Errors/AdyenCheckoutError';
import { TxVariants } from '../tx-variants';
import { onSubmitReject } from '../../core/types';
import { AddressData, PaymentResponseData } from '../../types/global-types';
import { sanitizeResponse } from '../internal/UIElement/utils';

class GooglePay extends UIElement<GooglePayConfiguration> {
    public static type = TxVariants.googlepay;
    public static txVariants = [TxVariants.googlepay, TxVariants.paywithgoogle];
    public static defaultProps = defaultProps;

    protected readonly googlePay;

    constructor(props) {
        super(props);
        this.handleAuthorization = this.handleAuthorization.bind(this);

        this.googlePay = new GooglePayService({
            ...this.props,
            paymentDataCallbacks: {
                ...this.props.paymentDataCallbacks,
                onPaymentAuthorized: this.onPaymentAuthorized
            }
        });
    }

    formatProps(props): GooglePayConfiguration {
        // const allowedCardNetworks = props.brands?.length ? mapBrands(props.brands) : props.allowedCardNetworks;
        const buttonSizeMode = props.buttonSizeMode ?? (props.isDropin ? 'fill' : 'static');
        const buttonLocale = getGooglePayLocale(props.buttonLocale ?? props.i18n?.locale);

        const callbackIntents: google.payments.api.CallbackIntent[] = [
            ...props.callbackIntents,
            'PAYMENT_AUTHORIZATION'
        ];

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
    formatData() {
        const { googlePayCardNetwork, googlePayToken, billingAddress, deliveryAddress } = this.state;

        return {
            paymentMethod: {
                type: this.type,
                googlePayCardNetwork,
                googlePayToken
            },
            browserInfo: this.browserInfo,
            origin: !!window && window.location.origin,
            ...(billingAddress && { billingAddress }),
            ...(deliveryAddress && { deliveryAddress })
        };
    }

    public override submit = () => {
        new Promise((resolve, reject) => this.props.onClick(resolve, reject))
            .then(() => this.googlePay.initiatePayment(this.props))
            .catch((error: google.payments.api.PaymentsError) => {
                if (error.statusCode === 'CANCELED') {
                    this.handleError(new AdyenCheckoutError('CANCEL', error.toString(), { cause: error }));
                } else {
                    this.handleError(new AdyenCheckoutError('ERROR', error.toString(), { cause: error }));
                }
            });
    };

    /**
     * Method called when the payment is authorized in the payment sheet
     *
     * @see https://developers.google.com/pay/api/web/reference/client#onPaymentAuthorized
     **/
    private onPaymentAuthorized = async (
        paymentData: google.payments.api.PaymentData
    ): Promise<google.payments.api.PaymentAuthorizationResult> => {
        const billingAddress: AddressData = formatGooglePayContactToAdyenAddressFormat(
            paymentData.paymentMethodData.info.billingAddress
        );
        const deliveryAddress: AddressData = formatGooglePayContactToAdyenAddressFormat(
            paymentData.shippingAddress,
            true
        );

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
                .then(this.verifyPaymentDidNotFail)
                .then((paymentResponse: PaymentResponseData) => {
                    resolve({ transactionState: 'SUCCESS' });
                    return paymentResponse;
                })
                .then(paymentResponse => {
                    this.handleResponse(paymentResponse);
                })
                .catch((error: onSubmitReject) => {
                    this.setElementStatus('ready');

                    resolve({
                        transactionState: 'ERROR',
                        error: {
                            intent: error?.error?.googlePayError?.intent || 'PAYMENT_AUTHORIZATION',
                            message: error?.error?.googlePayError?.message || 'Payment failed',
                            reason: error?.error?.googlePayError?.reason || 'OTHER_ERROR'
                        }
                    });

                    this.handleFailedResult(error);
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
                    throw new Error('Google Pay is not available');
                }

                if (response.paymentMethodPresent === false) {
                    throw new Error('Google Pay - No paymentMethodPresent');
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
        return this.googlePay.prefetchPaymentData(this.props);
    };

    get browserInfo() {
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
                    paymentsClient={this.googlePay.paymentsClient}
                    onClick={this.submit}
                />
            );
        }

        return null;
    }
}

export default GooglePay;
