import { h } from 'preact';
import UIElement from '../UIElement';
import ApplePayButton from './components/ApplePayButton';
import ApplePayService from './ApplePayService';
import { preparePaymentRequest } from './payment-request';
import { normalizeAmount } from './utils';
import defaultProps from './defaultProps';
import { ApplePayElementProps, ApplePayElementData } from './types';

class ApplePayElement extends UIElement<ApplePayElementProps> {
    protected static type = 'applepay';
    protected static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.startSession = this.startSession.bind(this);
        this.submit = this.submit.bind(this);
    }

    /**
     * Formats the component props
     */
    protected formatProps(props) {
        const amount = normalizeAmount(props);

        return {
            onAuthorized: resolve => resolve(),
            onValidateMerchant: (resolve, reject) => reject('onValidateMerchant event not implemented'),
            ...props,
            totalPriceLabel: props.totalPriceLabel || props.configuration?.merchantName,
            amount,
            onCancel: event => props.onError(event)
        };
    }

    /**
     * Formats the component data output
     */
    protected formatData(): ApplePayElementData {
        return {
            paymentMethod: {
                type: ApplePayElement.type,
                ...this.state
            }
        };
    }

    submit() {
        this.startPayment();
    }

    startPayment() {
        return Promise.resolve(this.startSession(this.props.onAuthorized));
    }

    private startSession(onPaymentAuthorized) {
        const {
            version,
            onValidateMerchant,
            onSubmit,
            onCancel,
            onPaymentMethodSelected,
            onShippingMethodSelected,
            onShippingContactSelected
        } = this.props;

        const paymentRequest = preparePaymentRequest({
            companyName: this.props.configuration.merchantName,
            ...this.props
        });

        const session = new ApplePayService(paymentRequest, {
            version,
            onValidateMerchant,
            onCancel,
            onPaymentMethodSelected,
            onShippingMethodSelected,
            onShippingContactSelected,
            onPaymentAuthorized: (resolve, reject, event) => {
                if (!!event.payment.token && !!event.payment.token.paymentData) {
                    this.setState({ 'applepay.token': btoa(JSON.stringify(event.payment.token.paymentData)) });
                }

                onSubmit({ data: this.data, isValid: this.isValid }, this);
                onPaymentAuthorized(resolve, reject, event);
            }
        });

        session.begin();
    }

    /**
     * Validation
     *
     * @remarks
     * Apple Pay does not require any specific validation
     */
    get isValid(): boolean {
        return true;
    }

    /**
     * Determine a shopper's ability to return a form of payment from Apple Pay.
     * @returns Promise Resolve/Reject whether the shopper can use Apple Pay
     */
    isAvailable(): Promise<boolean> {
        if (document.location.protocol !== 'https:') {
            return Promise.reject(new Error('Trying to start an Apple Pay session from an insecure document'));
        }

        if (!this.props.onValidateMerchant) {
            return Promise.reject(new Error('onValidateMerchant event was not provided'));
        }

        if (window.ApplePaySession && ApplePaySession.canMakePayments() && ApplePaySession.supportsVersion(this.props.version)) {
            return Promise.resolve(ApplePaySession.canMakePayments());
        }

        return Promise.reject(new Error('Apple Pay is not available on this device'));
    }

    /**
     * Renders the Apple Pay button or nothing in the Dropin
     */
    render() {
        if (this.props.showPayButton) {
            return <ApplePayButton buttonColor={this.props.buttonColor} buttonType={this.props.buttonType} onClick={this.submit} />;
        }

        return null;
    }
}

export default ApplePayElement;
