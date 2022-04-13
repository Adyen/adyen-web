import { h } from 'preact';
import UIElement from '../UIElement';
import ApplePayButton from './components/ApplePayButton';
import ApplePayService from './ApplePayService';
import base64 from '../../utils/base64';
import defaultProps from './defaultProps';
import { httpPost } from '../../core/Services/http';
import { APPLEPAY_SESSION_ENDPOINT } from './config';
import { preparePaymentRequest } from './payment-request';
import { resolveSupportedVersion, mapBrands } from './utils';
import { ApplePayElementProps, ApplePayElementData, ApplePaySessionRequest } from './types';
import AdyenCheckoutError from '../../core/Errors/AdyenCheckoutError';

const latestSupportedVersion = 11;

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
        const supportedNetworks = props.brands?.length ? mapBrands(props.brands) : props.supportedNetworks;

        return {
            ...props,
            configuration: props.configuration,
            supportedNetworks,
            version,
            totalPriceLabel: props.totalPriceLabel || props.configuration?.merchantName,
            onCancel: event => this.handleError(new AdyenCheckoutError('CANCEL', event))
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
        return this.startSession(this.props.onAuthorized);
    }

    private startSession(onPaymentAuthorized) {
        const { version, onValidateMerchant, onCancel, onPaymentMethodSelected, onShippingMethodSelected, onShippingContactSelected, onAuthorizedBeforeSubmit } = this.props;

        return new Promise((resolve, reject) => this.props.onClick(resolve, reject)).then(() => {
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
                onPaymentAuthorized: async (resolve, reject, event) => {
                    if (!!event.payment.token && !!event.payment.token.paymentData) {
                        this.setState({ applePayToken: btoa(JSON.stringify(event.payment.token.paymentData)) });
                    }
                    if(onAuthorizedBeforeSubmit) {
                        await new Promise((resolve, reject) => onAuthorizedBeforeSubmit(resolve, reject, event));
                    }
                    super.submit();
                    onPaymentAuthorized(resolve, reject, event);
                }
            });

            session.begin();
        });
    }

    private async validateMerchant(resolve, reject) {
        const { hostname: domainName } = window.location;
        const { clientKey, configuration, loadingContext, initiative } = this.props;
        const { merchantName, merchantId } = configuration;
        const path = `${APPLEPAY_SESSION_ENDPOINT}?clientKey=${clientKey}`;
        const options = { loadingContext, path };
        const request: ApplePaySessionRequest = { displayName: merchantName, domainName, initiative, merchantIdentifier: merchantId };

        try {
            const response = await httpPost(options, request);
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
            return Promise.reject(new AdyenCheckoutError('IMPLEMENTATION_ERROR', 'Trying to start an Apple Pay session from an insecure document'));
        }

        if (!this.props.onValidateMerchant && !this.props.clientKey) {
            return Promise.reject(new AdyenCheckoutError('IMPLEMENTATION_ERROR', 'clientKey was not provided'));
        }

        if (window.ApplePaySession && ApplePaySession.canMakePayments() && ApplePaySession.supportsVersion(this.props.version)) {
            return Promise.resolve(true);
        }

        return Promise.reject(new AdyenCheckoutError('ERROR', 'Apple Pay is not available on this device'));
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
