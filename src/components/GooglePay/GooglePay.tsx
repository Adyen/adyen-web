import { h } from 'preact';
import UIElement from '../UIElement';
import GooglePayService from './GooglePayService';
import GooglePayButton from './components/GooglePayButton';
import defaultProps from './defaultProps';

class GooglePay extends UIElement {
    public static type = 'paywithgoogle';
    public static defaultProps = defaultProps;
    protected googlePay = new GooglePayService(this.props.environment);

    /**
     * @private
     * Formats the component data input
     * @return {object} props
     */
    formatProps(props) {
        return {
            ...props,
            showButton: props.showPayButton === true
        };
    }

    /**
     * @private
     * Formats the component data output
     * @return {object} props
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

        return this.googlePay
            .initiatePayment(this.props)
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
            .catch((error: Error) => {
                console.error(error.message);
                return false;
            });
    };

    /**
     * Determine a shopper's ability to return a form of payment from the Google Pay API.
     */
    public isReadyToPay = (): Promise<google.payments.api.IsReadyToPayResponse> => {
        return this.googlePay.isReadyToPay(this.props);
    };

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
