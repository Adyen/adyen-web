import { h } from 'preact';
import UIElement from '../internal/UIElement/UIElement';
import ApplePayButton from './components/ApplePayButton';
import ApplePayService from './services/ApplePayService';
import base64 from '../../utils/base64';
import defaultProps from './defaultProps';
import { httpPost } from '../../core/Services/http';
import { preparePaymentRequest } from './utils/payment-request';
import AdyenCheckoutError from '../../core/Errors/AdyenCheckoutError';
import { DecodeObject } from '../../types/global-types';
import { TxVariants } from '../tx-variants';
import { sanitizeResponse, verifyPaymentDidNotFail } from '../internal/UIElement/utils';
import {
    ANALYTICS_EXPRESS_PAGES_ARRAY,
    ANALYTICS_INSTANT_PAYMENT_BUTTON,
    ANALYTICS_RENDERED_STR,
    ANALYTICS_SELECTED_STR
} from '../../core/Analytics/constants';
import { resolveSupportedVersion } from './utils/resolve-supported-version';
import { formatApplePayContactToAdyenAddressFormat } from './utils/format-applepay-contact-to-adyen-format';
import { mapBrands } from './utils/map-adyen-brands-to-applepay-brands';
import ApplePaySdkLoader from './services/ApplePaySdkLoader';
import { detectInIframe } from '../../utils/detectInIframe';
import type { ApplePayConfiguration, ApplePayElementData, ApplePayPaymentOrderDetails, ApplePaySessionRequest } from './types';
import type { ICore } from '../../core/types';
import type { PaymentResponseData, RawPaymentResponse } from '../../types/global-types';
import { AnalyticsEvent } from '../../core/Analytics/AnalyticsEvent';
import { AnalyticsInfoEvent } from '../../core/Analytics/AnalyticsInfoEvent';

const LATEST_APPLE_PAY_VERSION = 14;

class ApplePayElement extends UIElement<ApplePayConfiguration> {
    public static type = TxVariants.applepay;

    protected static defaultProps = defaultProps;

    private sdkLoader: ApplePaySdkLoader;
    private applePayVersionNumber: number = undefined;

    constructor(checkout: ICore, props?: ApplePayConfiguration) {
        super(checkout, props);

        const { isExpress, onShippingContactSelected, onShippingMethodSelected } = this.props;

        if (isExpress === false && (onShippingContactSelected || onShippingMethodSelected)) {
            throw new AdyenCheckoutError(
                'IMPLEMENTATION_ERROR',
                'ApplePay - You must set "isExpress" flag to "true" in order to use "onShippingContactSelected" and/or "onShippingMethodSelected" callbacks'
            );
        }

        this.startSession = this.startSession.bind(this);
        this.submit = this.submit.bind(this);
        this.validateMerchant = this.validateMerchant.bind(this);
        this.collectOrderTrackingDetailsIfNeeded = this.collectOrderTrackingDetailsIfNeeded.bind(this);
        this.handleAuthorization = this.handleAuthorization.bind(this);
        this.defineApplePayVersionNumber = this.defineApplePayVersionNumber.bind(this);
        this.configureApplePayWebOptions = this.configureApplePayWebOptions.bind(this);

        this.sdkLoader = new ApplePaySdkLoader({ analytics: this.analytics });

        void this.sdkLoader
            .load()
            .then(this.defineApplePayVersionNumber)
            .then(this.configureApplePayWebOptions)
            .catch(error => {
                this.handleError(error);
            });
    }

    /**
     * Formats the component props
     */
    protected override formatProps(props: ApplePayConfiguration): ApplePayConfiguration {
        // @ts-ignore TODO: Fix brands prop
        const supportedNetworks = props.brands?.length ? mapBrands(props.brands) : props.supportedNetworks;

        return {
            ...props,
            configuration: props.configuration,
            supportedNetworks,
            buttonLocale: props.buttonLocale ?? props.i18n?.locale,
            totalPriceLabel: props.totalPriceLabel || props.configuration?.merchantName,
            renderApplePayCodeAs: props.renderApplePayCodeAs ?? (detectInIframe() ? 'window' : 'modal')
        };
    }

    /**
     * Formats the component data output
     */
    protected override formatData(): ApplePayElementData {
        const { applePayToken, billingAddress, deliveryAddress } = this.state;
        const { isExpress } = this.props;

        return {
            paymentMethod: {
                type: ApplePayElement.type,
                applePayToken,
                ...(isExpress && { subtype: 'express' })
            },
            ...(billingAddress && { billingAddress }),
            ...(deliveryAddress && { deliveryAddress })
        };
    }

    protected submitAnalytics(analyticsObj: AnalyticsEvent) {
        // Analytics will need to know about this.props.isExpress & this.props.expressPage
        if (analyticsObj instanceof AnalyticsInfoEvent && analyticsObj.type === ANALYTICS_RENDERED_STR) {
            const { isExpress, expressPage } = this.props;
            const hasExpressPage = expressPage && ANALYTICS_EXPRESS_PAGES_ARRAY.includes(expressPage);

            if (typeof isExpress === 'boolean') {
                analyticsObj.isExpress = isExpress;
            }

            if (isExpress === true && hasExpressPage) {
                analyticsObj.expressPage = expressPage; // We only care about the expressPage value if isExpress is true
            }
        }

        super.submitAnalytics(analyticsObj);
    }

    public override submit = (): void => {
        // Analytics
        if (this.props.isInstantPayment) {
            const event = new AnalyticsInfoEvent({
                type: ANALYTICS_SELECTED_STR,
                target: ANALYTICS_INSTANT_PAYMENT_BUTTON
            });
            this.submitAnalytics(event);
        }
        void this.startSession();
    };

    public get isValid(): boolean {
        return true;
    }

    /**
     * This API is only intended for upstreaming or defaulting to Apple Pay, all other scenarios should continue to
     * use canMakePayments(). For Safari browsers, this API will indicate whether there is a card available to make
     * payments. For third-party browsers a new status of paymentCredentialStatusUnknown will be returned. This does
     * not mean there are no cards available, it means the status cannot be determined and as such defaulting
     * and upstreaming should still be considered.
     *
     * {@link https://developer.apple.com/documentation/apple_pay_on_the_web/applepaysession/4440085-applepaycapabilities}
     * @param merchantIdentifier
     */
    public async applePayCapabilities(merchantIdentifier?: string): Promise<ApplePayJS.PaymentCredentialStatusResponse> {
        const identifier = merchantIdentifier || this.props.configuration.merchantId;

        try {
            await this.sdkLoader.isSdkLoaded();
            return await ApplePaySession?.applePayCapabilities(identifier);
        } catch (error) {
            throw new AdyenCheckoutError('ERROR', 'Apple Pay: Error when requesting applePayCapabilities()', { cause: error });
        }
    }

    /**
     * Determines if Apple Pay component can be displayed or not
     */
    public override async isAvailable(): Promise<void> {
        if (window.location.protocol !== 'https:') {
            return Promise.reject(new AdyenCheckoutError('IMPLEMENTATION_ERROR', 'Trying to start an Apple Pay session from an insecure document'));
        }

        try {
            await this.sdkLoader.isSdkLoaded();

            if (ApplePaySession?.canMakePayments()) {
                return Promise.resolve();
            }

            return Promise.reject(new AdyenCheckoutError('ERROR', 'Apple Pay is not available on this device'));
        } catch (error) {
            return Promise.reject(new AdyenCheckoutError('ERROR', 'Apple Pay SDK failed to load', { cause: error }));
        }
    }

    /**
     * Sets the Apple Pay version available for the shopper.
     * This code needs to be executed once the  Apple Pay SDK is fully loaded
     * @private
     */
    private defineApplePayVersionNumber() {
        if (window.location.protocol !== 'https:') return;
        this.applePayVersionNumber = this.props.version || resolveSupportedVersion(LATEST_APPLE_PAY_VERSION);
    }

    /**
     * Sets the configuration/callbacks that pertain to the Apple Pay code overlay/modal.
     * @private
     */
    private configureApplePayWebOptions() {
        if (window.ApplePayWebOptions) {
            const { renderApplePayCodeAs, onApplePayCodeClose } = this.props;

            window.ApplePayWebOptions.set({
                renderApplePayCodeAs,
                ...(onApplePayCodeClose && { onApplePayCodeClose })
            });
        }
    }

    private startSession() {
        const { onValidateMerchant, onPaymentMethodSelected, onShippingMethodSelected, onShippingContactSelected } = this.props;

        const paymentRequest = preparePaymentRequest({
            companyName: this.props.configuration.merchantName,
            countryCode: this.core.options.countryCode,
            ...this.props
        });

        const session = new ApplePayService(paymentRequest, {
            version: this.applePayVersionNumber,
            onError: (error: unknown) => {
                this.handleError(
                    new AdyenCheckoutError('ERROR', 'ApplePay - Something went wrong on ApplePayService', {
                        cause: error
                    })
                );
            },
            onCancel: event => {
                this.handleError(new AdyenCheckoutError('CANCEL', 'ApplePay UI dismissed', { cause: event }));
            },
            onPaymentMethodSelected,
            onShippingMethodSelected,
            onShippingContactSelected,
            onValidateMerchant: onValidateMerchant || this.validateMerchant,
            onPaymentAuthorized: (resolve, reject, event) => {
                const billingAddress = formatApplePayContactToAdyenAddressFormat(event.payment.billingContact);
                const deliveryAddress = formatApplePayContactToAdyenAddressFormat(event.payment.shippingContact, true);

                this.setState({
                    applePayToken: btoa(JSON.stringify(event.payment.token.paymentData)),
                    authorizedEvent: event,
                    ...(billingAddress && { billingAddress }),
                    ...(deliveryAddress && { deliveryAddress })
                });

                this.handleAuthorization()
                    .then(this.makePaymentsCall)
                    .then(sanitizeResponse)
                    .then(verifyPaymentDidNotFail)
                    .then(this.collectOrderTrackingDetailsIfNeeded)
                    .then(({ paymentResponse, orderDetails }) => {
                        resolve({
                            status: ApplePaySession.STATUS_SUCCESS,
                            ...(orderDetails && { orderDetails })
                        });
                        return paymentResponse;
                    })
                    .then(paymentResponse => {
                        this.handleResponse(paymentResponse);
                    })
                    .catch((paymentResponse?: RawPaymentResponse) => {
                        const errors = paymentResponse?.error?.applePayError;

                        reject({
                            status: ApplePaySession.STATUS_FAILURE,
                            errors: errors ? (Array.isArray(errors) ? errors : [errors]) : undefined
                        });

                        const responseWithError: RawPaymentResponse = {
                            ...paymentResponse,
                            error: {
                                applePayError: errors
                            }
                        };

                        this.handleFailedResult(responseWithError);
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

    /**
     * Call the 'onAuthorized' callback if available.
     * Must be resolved/reject for the payment flow to continue
     *
     * @private
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
        }).catch((error?: ApplePayJS.ApplePayError) => {
            // Format error in a way that the 'catch' of the 'onPaymentAuthorize' block accepts it
            const data = { error: { applePayError: error } };
            return Promise.reject(data);
        });
    }

    /**
     * Verify if the 'onOrderTrackingRequest' is provided. If so, triggers the callback expecting an
     * Apple Pay order details back
     *
     * @private
     */
    private async collectOrderTrackingDetailsIfNeeded(
        paymentResponse: PaymentResponseData
    ): Promise<{ orderDetails?: ApplePayPaymentOrderDetails; paymentResponse: PaymentResponseData }> {
        return new Promise<ApplePayPaymentOrderDetails | void>((resolve, reject) => {
            if (!this.props.onOrderTrackingRequest) {
                return resolve();
            }

            this.props.onOrderTrackingRequest(resolve, reject);
        })
            .then(orderDetails => {
                return {
                    paymentResponse,
                    ...(orderDetails && { orderDetails })
                };
            })
            .catch(() => {
                return { paymentResponse };
            });
    }

    private async validateMerchant(resolve, reject) {
        const { hostname } = window.location;
        const { clientKey, configuration, loadingContext, initiative, domainName } = this.props;
        const { merchantName, merchantId } = configuration;
        const path = `v1/applePay/sessions?clientKey=${clientKey}`;
        const options = { loadingContext, path };
        const request: ApplePaySessionRequest = {
            displayName: merchantName,
            domainName: domainName || hostname,
            initiative,
            merchantIdentifier: merchantId
        };

        try {
            const response = await httpPost(options, request);
            const decodedData: DecodeObject = base64.decode(response.data);
            if (!decodedData.success) {
                reject('Could not decode Apple Pay session');
            } else {
                const session = JSON.parse(decodedData.data);
                resolve(session);
            }
        } catch (e) {
            reject('Could not get Apple Pay session');
        }
    }

    render() {
        if (!this.props.showPayButton) {
            return null;
        }

        return (
            <ApplePayButton
                buttonStyle={this.props.buttonColor}
                buttonType={this.props.buttonType}
                buttonLocale={this.props.buttonLocale}
                onClick={this.submit}
            />
        );
    }
}

export default ApplePayElement;
