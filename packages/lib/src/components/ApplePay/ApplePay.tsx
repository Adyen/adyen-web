import { h } from 'preact';
import UIElement from '../internal/UIElement/UIElement';
import ApplePayButton from './components/ApplePayButton';
import ApplePayService from './ApplePayService';
import base64 from '../../utils/base64';
import defaultProps from './defaultProps';
import { httpPost } from '../../core/Services/http';
import { APPLEPAY_SESSION_ENDPOINT } from './config';
import { preparePaymentRequest } from './payment-request';
import { resolveSupportedVersion, mapBrands, formatApplePayContactToAdyenAddressFormat } from './utils';
import AdyenCheckoutError from '../../core/Errors/AdyenCheckoutError';
import { DecodeObject } from '../../types/global-types';
import { TxVariants } from '../tx-variants';
import { sanitizeResponse, verifyPaymentDidNotFail } from '../internal/UIElement/utils';
import { ANALYTICS_INSTANT_PAYMENT_BUTTON, ANALYTICS_SELECTED_STR } from '../../core/Analytics/constants';

import type { ApplePayConfiguration, ApplePayElementData, ApplePayPaymentOrderDetails, ApplePaySessionRequest } from './types';
import type { ICore } from '../../core/types';
import type { PaymentResponseData, RawPaymentResponse } from '../../types/global-types';
import { SendAnalyticsObject } from '../../core/Analytics/types';

const latestSupportedVersion = 14;

class ApplePayElement extends UIElement<ApplePayConfiguration> {
    public static type = TxVariants.applepay;
    protected static defaultProps = defaultProps;

    constructor(checkout: ICore, props?: ApplePayConfiguration) {
        super(checkout, props);

        const { isExpress, onShippingContactSelected, onShippingMethodSelected } = this.props;

        if (isExpress === false && (onShippingContactSelected || onShippingMethodSelected)) {
            throw new AdyenCheckoutError(
                'IMPLEMENTATION_ERROR',
                'ApplePay - You must set "isExpress" flag to "true" in order to use "onShippingContactSelected" and/or "onShippingMethodSelected"'
            );
        }

        this.startSession = this.startSession.bind(this);
        this.submit = this.submit.bind(this);
        this.validateMerchant = this.validateMerchant.bind(this);
        this.collectOrderTrackingDetailsIfNeeded = this.collectOrderTrackingDetailsIfNeeded.bind(this);
        this.handleAuthorization = this.handleAuthorization.bind(this);
    }

    /**
     * Formats the component props
     */
    protected override formatProps(props) {
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

    protected submitAnalytics(analyticsObj: SendAnalyticsObject) {
        // Analytics will need to know about this.props.isExpress & this.props.expressPage
        super.submitAnalytics({ ...analyticsObj }, this.props);
    }

    public override submit = (): void => {
        // Analytics
        if (this.props.isInstantPayment) {
            this.submitAnalytics({ type: ANALYTICS_SELECTED_STR, target: ANALYTICS_INSTANT_PAYMENT_BUTTON });
        }
        void this.startSession();
    };

    private startSession() {
        const { version, onValidateMerchant, onPaymentMethodSelected, onShippingMethodSelected, onShippingContactSelected } = this.props;

        const paymentRequest = preparePaymentRequest({
            companyName: this.props.configuration.merchantName,
            countryCode: this.core.options.countryCode,
            ...this.props
        });

        const session = new ApplePayService(paymentRequest, {
            version,
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
        const { hostname: domainName } = window.location;
        const { clientKey, configuration, loadingContext, initiative } = this.props;
        const { merchantName, merchantId } = configuration;
        const path = `${APPLEPAY_SESSION_ENDPOINT}?clientKey=${clientKey}`;
        const options = { loadingContext, path };
        const request: ApplePaySessionRequest = {
            displayName: merchantName,
            domainName,
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
