import { h } from 'preact';
import UIElement from '../internal/UIElement/UIElement';
import GooglePayService from './GooglePayService';
import defaultProps from './defaultProps';
import { formatGooglePayContactToAdyenAddressFormat, getGooglePayLocale, resolveEnvironment } from './utils';
import collectBrowserInfo from '../../utils/browserInfo';
import AdyenCheckoutError from '../../core/Errors/AdyenCheckoutError';
import { TxVariants } from '../tx-variants';
import { sanitizeResponse, verifyPaymentDidNotFail } from '../internal/UIElement/utils';

import type { AddressData, BrowserInfo, RawPaymentMethod, PaymentResponseData, RawPaymentResponse } from '../../types/global-types';
import type { GooglePayConfiguration } from './types';
import type { ICore } from '../../core/types';
import { AnalyticsInfoEvent, InfoEventType, UiTarget } from '../../core/Analytics/events/AnalyticsInfoEvent';
import { mapGooglePayBrands } from './utils/map-adyen-brands-to-googlepay-brands';
import { PaymentDataRequest } from './models/PaymentDataRequest';
import { GooglePaymentMode, URL_GOOGLE_PAY_ACCELERATED_CHECKOUT } from './config';
import Script from '../../utils/Script';
import GoogleAcceleratedCheckoutClient, { AcceleratedCheckoutOptions } from './services/GoogleAcceleratedCheckoutClient';
import { GooglePayComponent } from './components/GooglePayComponent';
import { GOOGLE_PAY_ACCELERATED_DIV_ID } from './components/GoogleAcceleratedCheckout';

const DEFAULT_ALLOWED_CARD_NETWORKS: google.payments.api.CardNetwork[] = ['AMEX', 'DISCOVER', 'JCB', 'MASTERCARD', 'VISA'];

const GOOGLE_ACCELERATED_CHECKOUT_EXPERIMENT_COMPONENT = 'googlepay_accelerated_checkout_experiment';

class GooglePay extends UIElement<GooglePayConfiguration> {
    public static readonly type = TxVariants.googlepay;
    public static readonly txVariants = [TxVariants.googlepay, TxVariants.paywithgoogle];
    public static readonly defaultProps = defaultProps;

    private readonly googleButtonClient: GooglePayService;
    private readonly googleAcceleratedCheckoutClient: GoogleAcceleratedCheckoutClient;

    public mode: GooglePaymentMode = GooglePaymentMode.STANDARD_BUTTON;

    constructor(checkout: ICore, props?: GooglePayConfiguration) {
        super(checkout, props);
        this.handleAuthorization = this.handleAuthorization.bind(this);
        this.showGooglePayPaymentSheet = this.showGooglePayPaymentSheet.bind(this);

        const { isExpress, paymentDataCallbacks } = this.props;

        if (isExpress === false && paymentDataCallbacks?.onPaymentDataChanged) {
            throw new AdyenCheckoutError(
                'IMPLEMENTATION_ERROR',
                'GooglePay - You must set "isExpress" flag to "true" in order to use "onPaymentDataChanged" callback'
            );
        }

        if (!this.props.configuration.merchantId) {
            throw new AdyenCheckoutError(
                'IMPLEMENTATION_ERROR',
                'GooglePay - Missing merchantId. Please ensure that it is correctly configured in your customer area.'
            );
        }

        const paymentDataRequest = new PaymentDataRequest(this.props);
        const acceleratedOptions: AcceleratedCheckoutOptions = {
            environment: resolveEnvironment(this.props.environment),
            acceleratedCheckoutConfig: {
                type: 'INLINE',
                containerId: GOOGLE_PAY_ACCELERATED_DIV_ID
            },
            paymentDataCallbacks: {
                onPaymentAuthorized: this.onPaymentAuthorized
            },
            checkoutRequest: paymentDataRequest
        };

        this.googleAcceleratedCheckoutClient = new GoogleAcceleratedCheckoutClient(
            acceleratedOptions,
            new Script({ src: URL_GOOGLE_PAY_ACCELERATED_CHECKOUT, component: 'googlepay', analytics: this.analytics })
        );

        this.googleButtonClient = new GooglePayService(this.props.environment, this.analytics, {
            ...(isExpress && paymentDataCallbacks?.onPaymentDataChanged && { onPaymentDataChanged: paymentDataCallbacks.onPaymentDataChanged }),
            onPaymentAuthorized: this.onPaymentAuthorized
        });
    }

    /**
     * Google Pay requires custom logic due to supporting two Tx variants that lead to the same payment method.
     * If the merchant creates a standalone Google Pay component, we need to verify if the payment method is available using both tx variants
     *
     * @param type
     * @param paymentMethodId - Unique internal payment method ID
     * @returns
     */
    protected override getPaymentMethodFromPaymentMethodsResponse(type?: string, paymentMethodId?: string): RawPaymentMethod {
        if (paymentMethodId) return this.core.paymentMethodsResponse.findById(paymentMethodId);

        return (
            this.core.paymentMethodsResponse.find(type || this.constructor['type']) || this.core.paymentMethodsResponse.find(TxVariants.paywithgoogle)
        );
    }

    protected override formatProps(props: GooglePayConfiguration): GooglePayConfiguration {
        const buttonSizeMode = props.buttonSizeMode ?? (props.isDropin ? 'fill' : 'static');
        const buttonLocale = getGooglePayLocale(props.buttonLocale ?? props.i18n?.locale);

        const callbackIntents: google.payments.api.CallbackIntent[] = [...props.callbackIntents, 'PAYMENT_AUTHORIZATION'];

        const allowedCardNetworks = this.createAllowedCardNetworksValues({
            allowedCardNetworks: props.allowedCardNetworks,
            brands: props.brands
        });

        // Temporary hack to enable accelerated checkout experiment
        const configuration: GooglePayConfiguration['configuration'] = props.configuration;
        if (props.acceleratedCheckout) {
            configuration.acceleratedCheckoutExperiment = 'enabled';
        }

        return {
            ...props,
            allowedCardNetworks,
            configuration,
            buttonSizeMode,
            buttonLocale,
            callbackIntents
        };
    }

    /**
     * Formats the component data output
     */
    protected override formatData() {
        const { googlePayCardNetwork, googlePayToken, billingAddress, deliveryAddress } = this.state;
        const { isExpress } = this.props;

        return {
            paymentMethod: {
                type: this.type,
                googlePayCardNetwork,
                googlePayToken,
                ...(isExpress && { subtype: 'express' })
            },
            browserInfo: this.browserInfo,
            origin: !!window && window.location.origin,
            ...(billingAddress && { billingAddress }),
            ...(deliveryAddress && { deliveryAddress })
        };
    }

    /**
     * Indicates if the Google Pay component is using the accelerated checkout flow
     */
    public isAcceleratedCheckoutAvailable(): boolean {
        return this.mode === GooglePaymentMode.ACCELERATED_CHECKOUT && this.props.configuration?.acceleratedCheckoutExperiment === 'enabled';
    }

    /**
     * Determine a shopper's ability to return a form of payment from the Google Pay API.
     */
    public override async isAvailable(): Promise<void> {
        const [acceleratedCheckoutResult, googleButtonResult] = await Promise.allSettled([
            this.googleAcceleratedCheckoutClient.isAvailable(),
            this.googleButtonClient.isReadyToPay(this.props)
        ]);

        if (acceleratedCheckoutResult.status === 'fulfilled') {
            console.log('[Adyen] GAC isAvailable() result', acceleratedCheckoutResult.value);

            const { status } = acceleratedCheckoutResult.value;

            this.analytics.sendAnalytics(
                new AnalyticsInfoEvent({
                    type: status === 'SUCCESS' ? InfoEventType.eligibilityPassed : InfoEventType.eligibilityFailed,
                    component: GOOGLE_ACCELERATED_CHECKOUT_EXPERIMENT_COMPONENT
                })
            );

            // Show Accelerated Checkout only when it's available and experiment is enabled
            if (status === 'SUCCESS' && this.props.configuration.acceleratedCheckoutExperiment === 'enabled') {
                this.mode = GooglePaymentMode.ACCELERATED_CHECKOUT;
                return;
            }
        } else {
            console.log('[Adyen] isAvailable() acceleratedCheckoutResult', acceleratedCheckoutResult.reason);

            this.analytics.sendAnalytics(
                new AnalyticsInfoEvent({
                    type: InfoEventType.eligibilityFailed,
                    component: GOOGLE_ACCELERATED_CHECKOUT_EXPERIMENT_COMPONENT
                })
            );
        }

        if (googleButtonResult.status === 'fulfilled') {
            const isReadyToPayResponse = googleButtonResult.value;

            console.log('[Adyen] isReadyToPay() result', isReadyToPayResponse);

            if (!isReadyToPayResponse.result) {
                throw new AdyenCheckoutError('ERROR', 'GooglePay is not available');
            }
            if (isReadyToPayResponse.paymentMethodPresent === false) {
                throw new AdyenCheckoutError('ERROR', 'GooglePay - No paymentMethodPresent');
            }

            return;
        }

        throw new AdyenCheckoutError('ERROR', 'GooglePay is not available', { cause: googleButtonResult.reason });
    }

    /**
     * Generate the 'allowedCardNetworks' value used by Google Pay
     *
     * If the 'allowedCardNetworks' is defined in the Component configuration, it will be used. Otherwise we fallback
     * to use the 'brands' returned by the backoffice. It can be that 'brands' is not returned, which in this case we
     * set default values
     *
     * @param {object} brandsConfig
     * @param brandsConfig.allowedCardNetworks - Brands set in the component config
     * @param brandsConfig.brands - Brands returned by backend
     * @private
     */
    private createAllowedCardNetworksValues({
        allowedCardNetworks,
        brands
    }: {
        allowedCardNetworks?: google.payments.api.CardNetwork[];
        brands?: string[];
    }): google.payments.api.CardNetwork[] {
        if (allowedCardNetworks?.length > 0) return allowedCardNetworks;
        if (brands?.length > 0) return mapGooglePayBrands(brands);

        return DEFAULT_ALLOWED_CARD_NETWORKS;
    }

    protected override beforeRender(configSetByMerchant?: GooglePayConfiguration) {
        // We don't send 'rendered' events when rendering actions
        if (configSetByMerchant?.originalAction) {
            return;
        }

        const event = new AnalyticsInfoEvent({
            type: InfoEventType.rendered,
            component: this.type,
            configData: { ...configSetByMerchant, showPayButton: this.props.showPayButton },
            ...(configSetByMerchant?.isExpress && { isExpress: configSetByMerchant.isExpress }),
            ...(configSetByMerchant?.expressPage && { expressPage: configSetByMerchant.expressPage })
        });

        this.analytics.sendAnalytics(event);
    }

    /**
     * Displays the Google Pay payment sheet overlay
     */
    private showGooglePayPaymentSheet() {
        this.googleButtonClient.initiatePayment(this.props, this.core.options.countryCode).catch((error: google.payments.api.PaymentsError) => {
            // eslint-disable-next-line @typescript-eslint/no-base-to-string
            this.handleError(new AdyenCheckoutError(error.statusCode === 'CANCELED' ? 'CANCEL' : 'ERROR', error.toString(), { cause: error }));
        });
    }

    public override submit = () => {
        if (this.props.isInstantPayment) {
            const event = new AnalyticsInfoEvent({
                component: this.type,
                type: InfoEventType.selected,
                target: UiTarget.instantPaymentButton
            });

            this.submitAnalytics(event);
        }

        new Promise<void>((resolve, reject) => this.props.onClick(resolve, reject)).then(this.showGooglePayPaymentSheet).catch(() => {
            // Swallow exception triggered by onClick reject
        });
    };

    /**
     * Method called when the payment is authorized in the payment sheet
     *
     * @see https://developers.google.com/pay/api/web/reference/client#onPaymentAuthorized
     **/
    private onPaymentAuthorized = async (paymentData: google.payments.api.PaymentData): Promise<google.payments.api.PaymentAuthorizationResult> => {
        const billingAddress: AddressData = formatGooglePayContactToAdyenAddressFormat(paymentData.paymentMethodData.info.billingAddress);
        const deliveryAddress: AddressData = formatGooglePayContactToAdyenAddressFormat(paymentData.shippingAddress, true);

        this.setState({
            authorizedEvent: paymentData,
            googlePayToken: paymentData.paymentMethodData.tokenizationData.token,
            googlePayCardNetwork: paymentData.paymentMethodData.info.cardNetwork,
            ...(billingAddress && { billingAddress }),
            ...(deliveryAddress && { deliveryAddress })
        });

        return new Promise<google.payments.api.PaymentAuthorizationResult>(resolve => {
            this.handleAuthorization()
                .then(this.makePaymentsCall)
                .then(sanitizeResponse)
                .then(verifyPaymentDidNotFail)
                .then((paymentResponse: PaymentResponseData) => {
                    resolve({ transactionState: 'SUCCESS' });
                    return paymentResponse;
                })
                .then(paymentResponse => {
                    this.handleResponse(paymentResponse);
                })
                .catch((paymentResponse?: RawPaymentResponse) => {
                    this.setElementStatus('ready');

                    const googlePayError = paymentResponse?.error?.googlePayError;
                    const fallbackMessage = this.props.i18n.get('error.subtitle.payment');

                    const error: google.payments.api.PaymentDataError =
                        typeof googlePayError === 'string' || undefined
                            ? {
                                  intent: 'PAYMENT_AUTHORIZATION',
                                  reason: 'OTHER_ERROR',
                                  message: (googlePayError as string) || fallbackMessage
                              }
                            : {
                                  intent: googlePayError?.intent || 'PAYMENT_AUTHORIZATION',
                                  reason: googlePayError?.reason || 'OTHER_ERROR',
                                  message: googlePayError?.message || fallbackMessage
                              };

                    resolve({
                        transactionState: 'ERROR',
                        error
                    });

                    const responseWithError = {
                        ...paymentResponse,
                        error: {
                            googlePayError: error
                        }
                    };

                    this.handleFailedResult(responseWithError);
                });
        });
    };

    /**
     * Call the 'onAuthorized' callback if available.
     * Must be resolved/reject for the payment flow to continue
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
        }).catch((error?: google.payments.api.PaymentDataError | string) => {
            // Format error in a way that the 'catch' of the 'onPaymentAuthorize' block accepts it
            const data = { error: { googlePayError: error } };
            return Promise.reject(data);
        });
    }

    public get isValid(): boolean {
        return true;
    }

    /**
     * Determine a shopper's ability to return a form of payment from the Google Pay API.
     */
    public isReadyToPay = (): Promise<google.payments.api.IsReadyToPayResponse> => {
        return this.googleButtonClient.isReadyToPay(this.props);
    };

    /**
     * Use this method to prefetch a PaymentDataRequest configuration to improve loadPaymentData execution time on later user interaction. No value is returned.
     */
    public prefetch = (): void => {
        return this.googleButtonClient.prefetchPaymentData(this.props, this.core.options.countryCode);
    };

    get browserInfo(): BrowserInfo {
        return collectBrowserInfo();
    }

    get icon(): string {
        return this.props.icon ?? this.resources.getImage()('googlepay');
    }

    protected override componentToRender(): h.JSX.Element {
        return (
            <GooglePayComponent
                defaultMode={this.mode}
                googleButtonClient={this.googleButtonClient}
                googleAcceleratedCheckoutClient={this.googleAcceleratedCheckoutClient}
                showPayButton={this.props.showPayButton}
                googleButtonProps={{
                    buttonColor: this.props.buttonColor,
                    buttonType: this.props.buttonType,
                    buttonSizeMode: this.props.buttonSizeMode,
                    buttonLocale: this.props.buttonLocale,
                    buttonRadius: this.props.buttonRadius,
                    buttonRootNode: this.props.buttonRootNode,
                    onClick: this.submit
                }}
            />
        );
    }
}

export default GooglePay;
