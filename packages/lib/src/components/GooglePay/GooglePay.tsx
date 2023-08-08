import { h } from 'preact';
import UIElement from '../UIElement';
import GooglePayService from './GooglePayService';
import GooglePayButton from './components/GooglePayButton';
import defaultProps from './defaultProps';
import { GooglePayProps } from './types';
import { mapBrands, getGooglePayLocale } from './utils';
import collectBrowserInfo from '../../utils/browserInfo';
import AdyenCheckoutError from '../../core/Errors/AdyenCheckoutError';

class GooglePay extends UIElement<GooglePayProps> {
    public static type = 'paywithgoogle';
    public static defaultProps = defaultProps;
    protected googlePay = new GooglePayService(this.props);

    /**
     * Formats the component data input
     * For legacy support - maps configuration.merchantIdentifier to configuration.merchantId
     */
    formatProps(props): GooglePayProps {
        const allowedCardNetworks = props.brands?.length ? mapBrands(props.brands) : props.allowedCardNetworks;
        const buttonSizeMode = props.buttonSizeMode ?? (props.isDropin ? 'fill' : 'static');
        const buttonLocale = getGooglePayLocale(props.buttonLocale ?? props.i18n?.locale);
        return {
            ...props,
            showButton: props.showPayButton === true,
            configuration: props.configuration,
            allowedCardNetworks,
            buttonSizeMode,
            buttonLocale
        };
    }

    /**
     * Formats the component data output
     */
    formatData() {
        return {
            paymentMethod: {
                type: this.props.type ?? GooglePay.type,
                ...this.state
            },
            browserInfo: this.browserInfo
        };
    }

    public submit = () => {
        const { onAuthorized = () => {} } = this.props;

        return new Promise((resolve, reject) => this.props.onClick(resolve, reject))
            .then(() => this.googlePay.initiatePayment(this.props))
            .then(paymentData => {
                this.setState({
                    googlePayToken: paymentData.paymentMethodData.tokenizationData.token,
                    googlePayCardNetwork: paymentData.paymentMethodData.info.cardNetwork
                });
                super.submit();

                return onAuthorized(paymentData);
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
     * Validation
     */
    get isValid(): boolean {
        return !!this.state.googlePayToken;
    }

    /**
     * Determine a shopper's ability to return a form of payment from the Google Pay API.
     */
    public isAvailable = (): Promise<boolean> => {
        return this.isReadyToPay()
            .then(response => {
                if (!response.result) {
                    throw new Error('Google Pay is not available');
                }

                if (response.paymentMethodPresent === false) {
                    throw new Error('Google Pay - No paymentMethodPresent');
                }

                return true;
            })
            .catch(() => {
                return false;
            });
    };

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
