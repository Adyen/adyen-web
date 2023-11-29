import { h } from 'preact';
import UIElement, { SubmitReject } from '../UIElement';
import GooglePayService from './GooglePayService';
import GooglePayButton from './components/GooglePayButton';
import defaultProps from './defaultProps';
import { GooglePayProps } from './types';
import { getGooglePayLocale } from './utils';
import collectBrowserInfo from '../../utils/browserInfo';
import AdyenCheckoutError from '../../core/Errors/AdyenCheckoutError';
import { TxVariants } from '../tx-variants';

class GooglePay extends UIElement<GooglePayProps> {
    public static type = TxVariants.googlepay;
    public static txVariants = [TxVariants.googlepay, TxVariants.paywithgoogle];
    public static defaultProps = defaultProps;

    protected readonly googlePay;

    constructor(props) {
        super(props);

        this.googlePay = new GooglePayService({
            ...this.props,
            paymentDataCallbacks: {
                ...this.props.paymentDataCallbacks,
                onPaymentAuthorized: this.onPaymentAuthorized
            }
        });
    }

    formatProps(props: GooglePayProps): GooglePayProps {
        // const allowedCardNetworks = props.brands?.length ? mapBrands(props.brands) : props.allowedCardNetworks; BRANDS not documented
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
    formatData() {
        return {
            paymentMethod: {
                type: this.type,
                googlePayCardNetwork: this.state.googlePayCardNetwork,
                googlePayToken: this.state.googlePayToken
            },
            browserInfo: this.browserInfo
        };
    }

    public submit = () => {
        return new Promise((resolve, reject) => this.props.onClick(resolve, reject))
            .then(() => this.googlePay.initiatePayment(this.props))
            .then(() => {
                console.log('HERE');
            })
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
    private onPaymentAuthorized = async (paymentData: google.payments.api.PaymentData): Promise<google.payments.api.PaymentAuthorizationResult> => {
        this.setState({
            authorizedData: paymentData,
            googlePayToken: paymentData.paymentMethodData.tokenizationData.token,
            googlePayCardNetwork: paymentData.paymentMethodData.info.cardNetwork
        });

        return new Promise<google.payments.api.PaymentAuthorizationResult>(resolve => {
            super
                .submit()
                // TODO: add action.resolve type
                .then((result: any) => {
                    resolve({ transactionState: 'SUCCESS' });
                    return result;
                })
                .then(result => {
                    debugger;
                    if (result.action) {
                        this.elementRef.handleAction(result.action, result.actionProps);
                        return;
                    }
                    //
                    // // if (data.order) {
                    // //     const { order, paymentMethodsResponse } = data;
                    // //     // @ts-ignore Just testing
                    // //     this.core.update({ paymentMethodsResponse, order, amount: data.order.remainingAmount });
                    // //     return;
                    // // }
                    //
                    this.handleFinalResult(result);
                })
                .catch(error => {
                    this.setElementStatus('ready');

                    resolve({
                        transactionState: 'ERROR',
                        error: {
                            intent: 'PAYMENT_AUTHORIZATION',
                            message: error?.googlePayError?.message || 'Something went wrong',
                            reason: error?.googlePayError?.reason || 'OTHER_ERROR'
                        }
                    });
                });
        });
    };

    private override async submitUsingAdvancedFlow(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.props.onSubmit(
                {
                    data: this.data,
                    isValid: this.isValid,
                    ...(this.state.authorizedData && { authorizedData: this.state.authorizedData })
                },
                this.elementRef,
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
