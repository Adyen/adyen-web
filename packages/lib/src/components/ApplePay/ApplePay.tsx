import { h } from 'preact';
import UIElement from '../internal/UIElement/UIElement';
import ApplePayButton from './components/ApplePayButton';
import ApplePayService from './ApplePayService';
import base64 from '../../utils/base64';
import defaultProps from './defaultProps';
import { httpPost } from '../../core/Services/http';
import { APPLEPAY_SESSION_ENDPOINT } from './config';
import { preparePaymentRequest } from './payment-request';
import { resolveSupportedVersion, mapBrands } from './utils';
import { ApplePayConfiguration, ApplePayElementData, ApplePaySessionRequest } from './types';
import AdyenCheckoutError from '../../core/Errors/AdyenCheckoutError';
import { TxVariants } from '../tx-variants';
import { onSubmitReject } from '../../core/types';
import { PaymentResponseData } from '../../types/global-types';

const latestSupportedVersion = 14;

class ApplePayElement extends UIElement<ApplePayConfiguration> {
    public static type = TxVariants.applepay;
    protected static defaultProps = defaultProps;

    constructor(props: ApplePayConfiguration) {
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
            totalPriceLabel: props.totalPriceLabel || props.configuration?.merchantName
        };
    }

    /**
     * Formats the component data output
     */
    protected formatData(): ApplePayElementData {
        return {
            paymentMethod: {
                type: ApplePayElement.type,
                applePayToken: this.state.applePayToken
            }
        };
    }

    public submit = (): void => {
        this.startSession();
    };

    // private startSession(onPaymentAuthorized: OnAuthorizedCallback) {
    private startSession() {
        const { version, onValidateMerchant, onPaymentMethodSelected, onShippingMethodSelected, onShippingContactSelected } = this.props;

        const paymentRequest = preparePaymentRequest({
            companyName: this.props.configuration.merchantName,
            ...this.props
        });

        const session = new ApplePayService(paymentRequest, {
            version,
            onError: (error: unknown) => {
                this.handleError(new AdyenCheckoutError('ERROR', 'ApplePay - Something went wrong on ApplePayService', { cause: error }));
            },
            onCancel: event => {
                this.handleError(new AdyenCheckoutError('CANCEL', 'ApplePay UI dismissed', { cause: event }));
            },
            onPaymentMethodSelected,
            onShippingMethodSelected,
            onShippingContactSelected,
            onValidateMerchant: onValidateMerchant || this.validateMerchant,
            onPaymentAuthorized: (resolve, reject, event) => {
                this.setState({
                    applePayToken: btoa(JSON.stringify(event.payment.token.paymentData))
                });

                this.makePaymentsCall()
                    .then((paymentResponse: PaymentResponseData) => {
                        // check the order part here
                        resolve();
                        return paymentResponse;
                    })
                    .then(paymentResponse => {
                        this.handleResponse(paymentResponse);
                    })
                    .catch((error: onSubmitReject) => {
                        this.setElementStatus('ready');
                        const errors = error?.error?.applePayError;

                        reject({
                            status: ApplePaySession.STATUS_FAILURE,
                            errors: errors ? (Array.isArray(errors) ? errors : [errors]) : undefined
                        });
                    });
            }
        });

        return new Promise((resolve, reject) => this.props.onClick(resolve, reject))
            .then(() => {
                session.begin();
            })
            .catch(() => ({
                // Swallow exception triggered by onClick reject
            }));
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
    public override async isAvailable(): Promise<void> {
        if (document.location.protocol !== 'https:') {
            return Promise.reject(new AdyenCheckoutError('IMPLEMENTATION_ERROR', 'Trying to start an Apple Pay session from an insecure document'));
        }

        if (!this.props.onValidateMerchant && !this.props.clientKey) {
            return Promise.reject(new AdyenCheckoutError('IMPLEMENTATION_ERROR', 'clientKey was not provided'));
        }

        try {
            if (window.ApplePaySession && ApplePaySession.canMakePayments() && ApplePaySession.supportsVersion(this.props.version)) {
                return Promise.resolve();
            }
        } catch (error) {
            console.warn(error);
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
