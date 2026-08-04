import { h } from 'preact';
import UIElement from '../internal/UIElement/UIElement';
import PaypalComponent from './components/PaypalComponent';
import defaultProps from './defaultProps';
import AdyenCheckoutError from '../../core/Errors/AdyenCheckoutError';
import { ERRORS } from './constants';
import { TxVariants } from '../tx-variants';
import { formatPaypalOrderContactToAdyenFormat } from './utils/format-paypal-order-contact-to-adyen-format';

import type { AdditionalDetailsData, ICore } from '../../core/types';
import type { PaymentAction, PaymentResponseData } from '../../types/global-types';
import type { Intent, PayPalConfiguration } from './types';
import type {
    PayPalOnApproveActions,
    PayPalOnApproveData,
    PayPalOnShippingAddressChangeActions,
    PayPalOnShippingAddressChangeData,
    PayPalOnShippingOptionsChangeActions,
    PayPalOnShippingOptionsChangeData,
    PayPalOrderResponseBody,
    PayPalV6OnApproveData,
    PayPalV6OnShippingAddressChangeData,
    PayPalV6OnShippingOptionsChangeData
} from './paypal-js-types';

import { AnalyticsInfoEvent, InfoEventType } from '../../core/Analytics/events/AnalyticsInfoEvent';
import { sanitizeResponse, verifyPaymentDidNotFail } from '../internal/UIElement/utils';
import CancelError from '../../core/Errors/CancelError';
import { PayPalSdkLoader } from './services/PayPalSdkLoader';
import { PayPalService } from './services/PayPalService';
import { PayPalComponentV6 } from './components/PaypalComponentV6';
import './Paypal.scss';

class PaypalElement extends UIElement<PayPalConfiguration> {
    public static readonly type = TxVariants.paypal;
    public static readonly subtype = 'sdk';

    public paymentData: string | null = null;

    private resolve: ((value: string) => void) | null = null;
    private reject: ((error?: Error) => void) | null = null;

    protected static readonly defaultProps = defaultProps;

    private readonly paypalService?: PayPalService;

    constructor(checkout: ICore, props?: PayPalConfiguration) {
        super(checkout, props);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleOnShippingAddressChange = this.handleOnShippingAddressChange.bind(this);
        this.handleOnShippingOptionsChange = this.handleOnShippingOptionsChange.bind(this);

        if (this.props.usePayPalV6) {
            const paypalV6Props = this.props.usePayPalV6;

            const sdkLoader = new PayPalSdkLoader({
                analytics: this.analytics,
                environment: this.props.environment,
                nonce: paypalV6Props.nonce
            });

            this.paypalService = new PayPalService({
                sdkLoader,
                loadingContext: this.props.loadingContext ?? '',
                clientKey: this.props.clientKey ?? '',
                merchantId: this.props.configuration?.merchantId ?? '',
                countryCode: this.props.countryCode ?? '',
                amount: this.props.amount,
                vault: Boolean(paypalV6Props.vault),
                locale: paypalV6Props.locale,
                pageType: paypalV6Props.pageType,
                environment: this.props.environment
            });

            this.paypalService
                .initialize()
                .then(() => {
                    if (paypalV6Props.onCreatePayPalMessages && this.paypalService?.getInstance()?.createPayPalMessages) {
                        paypalV6Props.onCreatePayPalMessages(this.paypalService.getInstance().createPayPalMessages);
                    }
                })
                .catch(error => {
                    this.handleError(
                        error instanceof AdyenCheckoutError
                            ? error
                            : new AdyenCheckoutError('ERROR', 'Something went wrong while initializing PayPal', { cause: error })
                    );
                });
        }
    }

    public override async isAvailable(): Promise<void> {
        if (this.props.usePayPalV6) {
            if (!this.paypalService) {
                return Promise.reject(new AdyenCheckoutError('ERROR', 'PayPal is not available'));
            }

            await this.paypalService.isSdkLoaded();

            if (!this.paypalService.getEligiblePaymentMethods().isEligible('paypal')) {
                return Promise.reject(new AdyenCheckoutError('ERROR', 'PayPal is not available'));
            }

            return Promise.resolve();
        }

        return Promise.resolve();
    }

    formatProps(props: PayPalConfiguration): PayPalConfiguration {
        const merchantId = props.configuration?.merchantId;
        const intentFromConfig = props.configuration?.intent;
        const isZeroAuth = props.amount?.value === 0;
        const intent: Intent | undefined = isZeroAuth ? 'tokenize' : props.intent || intentFromConfig;
        const vault = intent === 'tokenize' || props.vault;

        const displayContinueToReviewPageButton = props.userAction === 'continue';

        return {
            ...props,
            commit: displayContinueToReviewPageButton ? false : props.commit,
            vault,
            configuration: {
                intent,
                merchantId
            }
        };
    }

    protected override beforeRender(configSetByMerchant?: PayPalConfiguration) {
        const event = new AnalyticsInfoEvent({
            type: InfoEventType.rendered,
            component: this.type,
            configData: { ...configSetByMerchant, showPayButton: this.props.showPayButton },
            ...(configSetByMerchant?.isExpress && { isExpress: configSetByMerchant.isExpress }),
            ...(configSetByMerchant?.expressPage && { expressPage: configSetByMerchant.expressPage })
        });

        this.analytics.sendAnalytics(event);
    }

    public submit = () => {
        this.handleError(new AdyenCheckoutError('IMPLEMENTATION_ERROR', ERRORS.SUBMIT_NOT_SUPPORTED));
    };

    /**
     * Updates the paymentData value. It must be used in the PayPal Express flow, when patching the amount
     * @param paymentData - Payment data value
     */
    public updatePaymentData(paymentData: string): void {
        if (!paymentData) console.warn('PayPal - Updating payment data with an invalid value');
        this.paymentData = paymentData;
    }

    /**
     * Formats the component data output
     */
    protected formatData() {
        const { isExpress, userAction } = this.props;

        return {
            paymentMethod: {
                type: PaypalElement.type,
                userAction,
                subtype: isExpress ? 'express' : PaypalElement.subtype
            }
        };
    }

    public handleAction = (action: PaymentAction) => {
        return this.updateWithAction(action);
    };

    public updateWithAction = (action: PaymentAction) => {
        if (action.paymentMethodType !== this.type) throw new Error('Invalid Action');

        if (action.paymentData) {
            this.paymentData = action.paymentData;
        }

        if (action.sdkData && action.sdkData.token) {
            this.onActionHandled({ componentType: this.type, actionDescription: 'sdk-loaded', originalAction: action });
            this.handleResolve(action.sdkData.token);
        } else {
            this.handleReject(ERRORS.NO_TOKEN_PROVIDED);
        }

        return null;
    };

    /**
     * Dropin Validation
     *
     * @remarks
     * Paypal does not require any specific Dropin validation
     */
    get isValid() {
        return true;
    }

    private readonly handleOnApprove = (data: PayPalOnApproveData, actions: PayPalOnApproveActions): Promise<void> => {
        const { onAuthorized } = this.props;
        const state = { data: { details: data, paymentData: this.paymentData ?? undefined } };

        if (!onAuthorized) {
            this.handleAdditionalDetails(state);
            return Promise.resolve();
        }

        if (!actions.order) {
            this.handleError(new AdyenCheckoutError('ERROR', 'PayPal order actions are not available'));
            return Promise.resolve();
        }

        return actions.order
            .get()
            .then((paypalOrder: PayPalOrderResponseBody) => {
                const billingAddress = formatPaypalOrderContactToAdyenFormat(paypalOrder?.payer);
                const deliveryAddress = formatPaypalOrderContactToAdyenFormat(paypalOrder?.purchase_units?.[0].shipping, true);

                this.setState({
                    authorizedEvent: paypalOrder,
                    ...(billingAddress && { billingAddress }),
                    ...(deliveryAddress && { deliveryAddress })
                });

                return new Promise<void>((resolve, reject) =>
                    onAuthorized(
                        {
                            authorizedEvent: paypalOrder,
                            ...(billingAddress && { billingAddress }),
                            ...(deliveryAddress && { deliveryAddress })
                        },
                        { resolve, reject }
                    )
                );
            })
            .then(() => this.handleAdditionalDetails(state))
            .catch(error => this.handleError(new AdyenCheckoutError('ERROR', 'Something went wrong while parsing PayPal Order', { cause: error })));
    };

    private readonly handleOnApproveV6 = (data: PayPalV6OnApproveData): Promise<void> => {
        let state: AdditionalDetailsData = {
            data: {
                details: data,
                paymentData: this.paymentData ?? undefined
            }
        };

        if ('orderId' in data) {
            const { orderId, payerId, ...restData } = data;
            state = {
                data: {
                    details: {
                        orderID: orderId,
                        payerID: payerId,
                        ...restData
                    },
                    paymentData: this.paymentData ?? undefined
                }
            };
        }

        this.handleAdditionalDetails(state);
        return Promise.resolve();
    };

    handleResolve(token: string) {
        if (!this.resolve) return this.handleError(new AdyenCheckoutError('ERROR', ERRORS.WRONG_INSTANCE));
        this.resolve(token);
    }

    handleReject(errorMessage: string) {
        if (!this.reject) return this.handleError(new AdyenCheckoutError('ERROR', ERRORS.WRONG_INSTANCE));
        this.reject(new Error(errorMessage));
    }

    private handleSubmit(): Promise<string> {
        return new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;

            this.makePaymentsCall()
                .then(sanitizeResponse)
                .then(verifyPaymentDidNotFail)
                .then(this.handleResponse)
                .catch((e: PaymentResponseData | Error) => {
                    if (e instanceof CancelError) {
                        this.setElementStatus('ready');
                        return;
                    }
                    this.handleFailedResult(e as PaymentResponseData);
                    const errorDetail = e instanceof Error ? e.message : JSON.stringify(e);
                    const errorMessage = e ? `: ${errorDetail}` : '';
                    this.handleReject(`${ERRORS.PAYMENT_FAILED}${errorMessage}`);
                });
        });
    }

    /**
     * If the merchant provides the 'onShippingAddressChange' callback, then this method is used as a wrapper to it, in order
     * to expose to the merchant the 'component' instance. The merchant needs the 'component' in order to manipulate the
     * paymentData
     *
     * @param data - PayPal data
     * @param actions - PayPal actions.
     */
    private handleOnShippingAddressChange(data: PayPalOnShippingAddressChangeData, actions: PayPalOnShippingAddressChangeActions): Promise<void> {
        const { onShippingAddressChange } = this.props;

        if (!onShippingAddressChange) return Promise.resolve();

        return onShippingAddressChange(data, actions, this);
    }

    /**
     * If the merchant provides the 'onShippingOptionsChange' callback, then this method is used as a wrapper to it, in order
     * to expose to the merchant the 'component' instance. The merchant needs the 'component' in order to manipulate the
     * paymentData
     *
     * @param data - PayPal data
     * @param actions - PayPal actions.
     */
    private handleOnShippingOptionsChange(data: PayPalOnShippingOptionsChangeData, actions: PayPalOnShippingOptionsChangeActions): Promise<void> {
        const { onShippingOptionsChange } = this.props;

        if (!onShippingOptionsChange) return Promise.resolve();

        return onShippingOptionsChange(data, actions, this);
    }

    /**
     * If the merchant provides the 'usePayPalV6' prop with an 'onShippingAddressChange' callback, then this method is used as a wrapper to it, in order
     * to expose to the merchant the 'component' instance. The merchant needs the 'component' in order to manipulate the
     * paymentData
     *
     * @param data - The shipping address change data
     */
    private handleOnShippingAddressChangeV6(data: PayPalV6OnShippingAddressChangeData): Promise<void> {
        const { usePayPalV6 } = this.props;

        if (!usePayPalV6?.onShippingAddressChange) return Promise.resolve();

        return usePayPalV6.onShippingAddressChange(data, this);
    }

    /**
     * If the merchant provides the 'usePayPalV6' prop with an 'onShippingOptionsChange' callback, then this method is used as a wrapper to it, in order
     * to expose to the merchant the 'component' instance. The merchant needs the 'component' in order to manipulate the
     * paymentData
     *
     * @param data - The shipping options change data
     */
    private handleOnShippingOptionsChangeV6(data: PayPalV6OnShippingOptionsChangeData): Promise<void> {
        const { usePayPalV6 } = this.props;

        if (!usePayPalV6?.onShippingOptionsChange) return Promise.resolve();

        return usePayPalV6.onShippingOptionsChange(data, this);
    }

    protected override componentToRender(): h.JSX.Element | null {
        if (!this.props.showPayButton) return null;

        if (this.props.usePayPalV6) {
            const { usePayPalV6: paypalv6Props } = this.props;

            if (!this.paypalService) return null;

            return (
                <PayPalComponentV6
                    setComponentRef={this.setComponentRef}
                    paypalService={this.paypalService}
                    {...(paypalv6Props.onShippingAddressChange && { onShippingAddressChange: this.handleOnShippingAddressChangeV6 })}
                    {...(paypalv6Props.onShippingOptionsChange && { onShippingOptionsChange: this.handleOnShippingOptionsChangeV6 })}
                    style={paypalv6Props.style}
                    commit={paypalv6Props.commit}
                    vault={paypalv6Props.vault}
                    blockPayPalCreditButton={paypalv6Props.blockPayPalCreditButton}
                    blockPayPalPayLaterButton={paypalv6Props.blockPayPalPayLaterButton}
                    blockPayPalVenmoButton={paypalv6Props.blockPayPalVenmoButton}
                    presentationModeOptions={paypalv6Props.presentationModeOptions}
                    onSubmit={this.handleSubmit}
                    onApprove={this.handleOnApproveV6}
                    onCancel={() => this.handleError(new AdyenCheckoutError('CANCEL'))}
                    onError={error => this.handleError(new AdyenCheckoutError('ERROR', String(error), { cause: error }))}
                />
            );
        }

        const { onShippingAddressChange, onShippingOptionsChange, ...rest } = this.props;

        return (
            <PaypalComponent
                {...rest}
                setComponentRef={this.setComponentRef}
                {...(onShippingAddressChange && { onShippingAddressChange: this.handleOnShippingAddressChange })}
                {...(onShippingOptionsChange && { onShippingOptionsChange: this.handleOnShippingOptionsChange })}
                onCancel={() => this.handleError(new AdyenCheckoutError('CANCEL'))}
                onChange={this.setState}
                onApprove={this.handleOnApprove}
                onError={error => {
                    this.handleError(new AdyenCheckoutError('ERROR', String(error), { cause: error }));
                }}
                onScriptLoadFailure={error => this.handleError(error)}
                onSubmit={this.handleSubmit}
            />
        );
    }
}

export default PaypalElement;
