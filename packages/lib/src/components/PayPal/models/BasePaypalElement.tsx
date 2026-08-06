import { h } from 'preact';
import AdyenCheckoutError from '../../../core/Errors/AdyenCheckoutError';
import UIElement from '../../internal/UIElement/UIElement';
import { TxVariants } from '../../tx-variants';
import { ERRORS } from '../constants';

import type { AdditionalDetailsData, ICore } from '../../../core/types';
import type { PaymentAction, PaymentResponseData } from '../../../types/global-types';
import type {
    PayPalComponents,
    PayPalV6OnApproveData,
    PayPalV6OnShippingAddressChangeData,
    PayPalV6OnShippingOptionsChangeData
} from '../paypal-js-types';
import type { BasePayPalConfiguration, SupportedPayPalFundingSources } from '../types';

import { AnalyticsInfoEvent, InfoEventType } from '../../../core/Analytics/events/AnalyticsInfoEvent';
import CancelError from '../../../core/Errors/CancelError';
import { sanitizeResponse, verifyPaymentDidNotFail } from '../../internal/UIElement/utils';
import { PayPalSdkLoader } from '../services/PayPalSdkLoader';
import { PayPalService } from '../services/PayPalService';
import requestPayPalOrderDetails from '../services/request-paypal-order-details';
import '../Paypal.scss';

export class BasePaypalElement<TProps extends BasePayPalConfiguration = BasePayPalConfiguration> extends UIElement<TProps> {
    public static readonly type: string = TxVariants.paypal;
    public static readonly subtype = 'sdk';

    protected readonly fundingSource: SupportedPayPalFundingSources = 'paypal';
    protected readonly elementName: string = 'PayPal';

    public paymentData: string | null = null;

    private resolve: ((value: string) => void) | null = null;
    private reject: ((error?: Error) => void) | null = null;

    protected paypalService?: PayPalService;

    constructor(checkout: ICore, props?: TProps) {
        super(checkout, props);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleOnShippingAddressChange = this.handleOnShippingAddressChange.bind(this);
        this.handleOnShippingOptionsChange = this.handleOnShippingOptionsChange.bind(this);
        this.handleOnApprove = this.handleOnApprove.bind(this);
        this.initialize = this.initialize.bind(this);

        this.initialize();
    }

    private initialize() {
        const sdkLoader = new PayPalSdkLoader({
            analytics: this.analytics,
            environment: this.props.environment,
            nonce: this.props?.nonce
        });

        this.paypalService = new PayPalService({
            sdkLoader,
            loadingContext: this.props.loadingContext ?? '',
            clientKey: this.props.clientKey ?? '',
            merchantId: this.props.configuration?.merchantId ?? '',
            countryCode: this.props.countryCode ?? '',
            amount: this.props.amount,
            vault: Boolean(this.props?.vault),
            locale: this.props?.locale,
            pageType: this.props?.pageType,
            environment: this.props.environment,
            components: this.paypalComponents
        });

        this.paypalService.initialize().catch(error => {
            this.handleError(
                error instanceof AdyenCheckoutError
                    ? error
                    : new AdyenCheckoutError('ERROR', `Something went wrong while initializing ${this.elementName}`, { cause: error })
            );
        });
    }

    protected get paypalComponents(): PayPalComponents {
        return ['paypal-payments'];
    }

    public override async isAvailable(): Promise<void> {
        if (!this.paypalService) {
            return Promise.reject(new AdyenCheckoutError('ERROR', `${this.elementName} is not available`));
        }

        await this.paypalService.isSdkLoaded();

        if (!this.paypalService.getEligiblePaymentMethods().isEligible(this.fundingSource)) {
            return Promise.reject(new AdyenCheckoutError('ERROR', `${this.elementName} is not available`));
        }

        return Promise.resolve();
    }

    protected override beforeRender(configSetByMerchant?: TProps) {
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
        if (!paymentData) console.warn(`${this.elementName} - Updating payment data with an invalid value`);
        this.paymentData = paymentData;
    }

    /**
     * Formats the component data output
     */
    protected formatData() {
        const { isExpress } = this.props;

        // TODO: Uncomment when we the paypal subvariants have been added on the backend
        // return {
        //     paymentMethod: {
        //         type: this.type,
        //         subtype: isExpress ? 'express' : BasePaypalElement.subtype
        //     }
        // };
        return {
            paymentMethod: {
                type: BasePaypalElement.type,
                subtype: isExpress ? 'express' : BasePaypalElement.subtype
            }
        };
    }

    public handleAction = (action: PaymentAction) => {
        return this.updateWithAction(action);
    };

    public updateWithAction = (action: PaymentAction) => {
        // TODO: Uncomment when we the paypal subvariants have been added on the backend
        // if (action.paymentMethodType !== this.type) throw new Error('Invalid Action');
        if (action.paymentMethodType !== BasePaypalElement.type) throw new Error('Invalid Action');

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

    /**
     * Handles the PayPal SDK v6 'onApprove' event. The shape of the data depends on which session type was started:
     * a one-time payment session returns an 'orderId', whereas a save payment session (zero-auth) returns a
     * 'vaultSetupToken'.
     *
     * @param data - Approve data from the PayPal SDK
     */
    protected handleOnApprove(data: PayPalV6OnApproveData): Promise<void> {
        const { onAuthorized } = this.props;

        let state: AdditionalDetailsData = {
            data: {
                details: data,
                paymentData: this.paymentData ?? undefined
            }
        };

        // 'orderId' is only present when the shopper approved a one-time payment session, meaning an actual
        // PayPal order was created. The SDK v6 keys are remapped to the casing expected by the /payments/details API.
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

        // 'vaultSetupToken' is only present when the shopper approved a save payment session (zero-auth
        // tokenization). No PayPal order exists in this flow, so the vault token is sent instead of an order id.
        if ('vaultSetupToken' in data) {
            const { vaultSetupToken, payerId, ...restData } = data;
            state = {
                data: {
                    details: {
                        vaultToken: vaultSetupToken,
                        payerID: payerId,
                        ...restData
                    },
                    paymentData: this.paymentData ?? undefined
                }
            };
        }

        // The order details can only be fetched for a one-time payment session, since the save payment session
        // does not create a PayPal order. Therefore 'onAuthorized' is skipped in the zero-auth flow.
        if (!onAuthorized || !('orderId' in data)) {
            this.handleAdditionalDetails(state);
            return Promise.resolve();
        }

        return requestPayPalOrderDetails(this.props.loadingContext ?? '', {
            clientKey: this.props.clientKey ?? '',
            merchantId: this.props.configuration?.merchantId ?? '',
            orderId: data.orderId
        })
            .then(res => {
                this.setState({
                    authorizedEvent: res.payPalOrder,
                    ...(res.billingAddress && { billingAddress: res.billingAddress }),
                    ...(res.deliveryAddress && { deliveryAddress: res.deliveryAddress }),
                    ...(res.shopperName && { shopperName: res.shopperName })
                });

                return new Promise<void>((resolve, reject) =>
                    onAuthorized(
                        {
                            authorizedEvent: res.payPalOrder,
                            ...(res.billingAddress && { billingAddress: res.billingAddress }),
                            ...(res.deliveryAddress && { deliveryAddress: res.deliveryAddress }),
                            ...(res.shopperName && { shopperName: res.shopperName })
                        },
                        { resolve, reject }
                    )
                );
            })
            .then(() => this.handleAdditionalDetails(state))
            .catch(error =>
                this.handleError(new AdyenCheckoutError('ERROR', `Something went wrong while fetching ${this.elementName} Order`, { cause: error }))
            );
    }

    handleResolve(token: string) {
        if (!this.resolve) return this.handleError(new AdyenCheckoutError('ERROR', ERRORS.WRONG_INSTANCE));
        this.resolve(token);
    }

    handleReject(errorMessage: string) {
        if (!this.reject) return this.handleError(new AdyenCheckoutError('ERROR', ERRORS.WRONG_INSTANCE));
        this.reject(new Error(errorMessage));
    }

    protected handleSubmit(): Promise<string> {
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
     * @param data - The shipping address change data
     */
    protected handleOnShippingAddressChange(data: PayPalV6OnShippingAddressChangeData): Promise<void> {
        const { onShippingAddressChange } = this.props;

        if (!onShippingAddressChange) return Promise.resolve();

        return onShippingAddressChange(data, this);
    }

    /**
     * If the merchant provides the 'onShippingOptionsChange' callback, then this method is used as a wrapper to it, in order
     * to expose to the merchant the 'component' instance. The merchant needs the 'component' in order to manipulate the
     * paymentData
     *
     * @param data - The shipping options change data
     */
    protected handleOnShippingOptionsChange(data: PayPalV6OnShippingOptionsChangeData): Promise<void> {
        const { onShippingOptionsChange } = this.props;

        if (!onShippingOptionsChange) return Promise.resolve();

        return onShippingOptionsChange(data, this);
    }

    protected override componentToRender(): h.JSX.Element | null {
        throw new Error('Method not implemented.');
    }
}
