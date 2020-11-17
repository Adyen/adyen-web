import { h } from 'preact';
import UIElement from '../UIElement';
import ApplePayButton from './components/ApplePayButton';
import ApplePayService from './ApplePayService';
import base64 from '../../utils/base64';
import defaultProps from './defaultProps';
import fetchJsonData from '../../core/Services/fetch-json-data';
import { APPLEPAY_SESSION_ENDPOINT } from './config';
import { preparePaymentRequest } from './payment-request';
import { resolveSupportedVersion } from './utils';
import { ApplePayElementProps, ApplePayElementData, ApplePaySessionRequest } from './types';

const latestSupportedVersion = 10;

class ApplePayElement extends UIElement<ApplePayElementProps> {
    protected static type = 'applepay';
    protected static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.startSession = this.startSession.bind(this);
        this.submit = this.submit.bind(this);
        this.validateMerchant = this.validateMerchant.bind(this);
    }

    /**
     * Formats the component props
     */
    protected formatProps(props) {
        const version = props.version || resolveSupportedVersion(latestSupportedVersion);

        return {
            ...props,
            version,
            totalPriceLabel: props.totalPriceLabel || props.configuration?.merchantName,
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
            onCancel,
            onPaymentMethodSelected,
            onShippingMethodSelected,
            onShippingContactSelected,
            onValidateMerchant: onValidateMerchant || this.validateMerchant,
            onPaymentAuthorized: (resolve, reject, event) => {
                if (!!event.payment.token && !!event.payment.token.paymentData) {
                    this.setState({ applePayToken: btoa(JSON.stringify(event.payment.token.paymentData)) });
                }

                onSubmit({ data: this.data, isValid: this.isValid }, this);
                onPaymentAuthorized(resolve, reject, event);
            }
        });

        session.begin();
    }

    private async validateMerchant(resolve, reject) {
        const { hostname: domainName } = window.location;
        const { clientKey, configuration, loadingContext, initiative } = this.props;
        const { merchantName, merchantId } = configuration;
        const options = { clientKey, loadingContext, path: APPLEPAY_SESSION_ENDPOINT };
        const request: ApplePaySessionRequest = { displayName: merchantName, domainName, initiative, merchantIdentifier: merchantId };

        try {
            const response = await fetchJsonData(options, request);
            const decodedData = base64.decode(response.data);
            if (!decodedData) reject('Could not decode Apple Pay session');
            const session = JSON.parse(decodedData as string);
            resolve(session);
        } catch (e) {
            reject('Could not get Apple Pay session');
        }
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

        if (!this.props.onValidateMerchant && !this.props.clientKey) {
            return Promise.reject(new Error('clientKey was not provided'));
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
            return (
                <ApplePayButton
                    i18n={this.props.i18n}
                    buttonColor={this.props.buttonColor}
                    buttonType={this.props.buttonType}
                    onClick={e => {
                        e.preventDefault();
                        this.submit();
                    }}
                />
            );
        }

        return null;
    }
}

export default ApplePayElement;
