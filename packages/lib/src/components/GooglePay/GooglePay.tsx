import { h } from 'preact';
import UIElement from '../UIElement';
import GooglePayService from './GooglePayService';
import GooglePayButton from './components/GooglePayButton';
import defaultProps from './defaultProps';
import { GooglePayProps } from './types';

class GooglePay extends UIElement<GooglePayProps> {
    public static type = 'paywithgoogle';
    public static defaultProps = defaultProps;
    protected googlePay = new GooglePayService(this.props);

    /**
     * Formats the component data input
     * For legacy support - maps configuration.merchantIdentifier to configuration.merchantId
     */
    formatProps(props) {
        const { configuration } = props;
        const { merchantIdentifier } = configuration;

        return {
            ...props,
            showButton: props.showPayButton === true,
            configuration: {
                ...configuration,
                ...(merchantIdentifier && { merchantId: merchantIdentifier })
            }
        };
    }

    /**
     * Formats the component data output
     */
    formatData() {
        return {
            paymentMethod: {
                type: GooglePay.type,
                ...this.state
            }
        };
    }

    public loadPayment = () => {
        const { onSubmit = () => {}, onAuthorized = () => {} } = this.props;

        return new Promise((resolve, reject) => this.props.onClick(resolve, reject))
            .then(() => this.googlePay.initiatePayment(this.props))
            .then(paymentData => {
                // setState will trigger an onChange event
                this.setState({
                    googlePayToken: paymentData.paymentMethodData.tokenizationData.token,
                    googlePayCardNetwork: paymentData.paymentMethodData.info.cardNetwork
                });

                onSubmit({ data: this.data, isValid: this.isValid }, this);
                return onAuthorized(paymentData);
            })
            .catch(error => {
                this.props.onError(error);
                return Promise.reject(error);
            });
    };

    public submit = () => {
        return this.loadPayment();
    };

    public startPayment = () => {
        return this.loadPayment();
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

    render() {
        if (this.props.showButton) {
            return (
                <GooglePayButton
                    buttonColor={this.props.buttonColor}
                    buttonType={this.props.buttonType}
                    paymentsClient={this.googlePay.paymentsClient}
                    onClick={this.submit}
                />
            );
        }

        return null;
    }
}

export default GooglePay;
