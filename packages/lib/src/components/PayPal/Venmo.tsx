import { h } from 'preact';
import UIElement from '../internal/UIElement/UIElement';
import defaultProps from './defaultProps';
import AdyenCheckoutError from '../../core/Errors/AdyenCheckoutError';
import { ERRORS } from './constants';
import { TxVariants } from '../tx-variants';
import { formatPaypalOrderContactToAdyenFormat } from './utils/format-paypal-order-contact-to-adyen-format';

import type { ICore } from '../../core/types';
import type { PaymentAction } from '../../types/global-types';
import type { Intent, PayPalConfiguration } from './types';

import { AnalyticsInfoEvent, InfoEventType } from '../../core/Analytics/events/AnalyticsInfoEvent';
import { PayPalService } from './PayPalService';
import { PayPalSdkLoader } from './PayPalSdkLoader';
import { VenmoComponent } from './components/VenmoComponent';
import './Paypal.scss';

class VenmoElement extends UIElement<PayPalConfiguration> {
    public static type = TxVariants.venmo;
    public static subtype = 'sdk';

    public paymentData: string = null;

    private resolve = null;
    private reject = null;

    private readonly paypalService: PayPalService;

    protected static defaultProps = defaultProps;

    constructor(checkout: ICore, props?: PayPalConfiguration) {
        super(checkout, props);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleOnShippingAddressChange = this.handleOnShippingAddressChange.bind(this);
        this.handleOnShippingOptionsChange = this.handleOnShippingOptionsChange.bind(this);

        const sdkLoader = new PayPalSdkLoader({ analytics: this.analytics });

        this.paypalService = PayPalService.getInstance({
            loadingContext: this.props.loadingContext,
            clientKey: this.props.clientKey,
            sdkLoader
        });

        void this.paypalService.initialize();
    }

    public override async isAvailable(): Promise<void> {
        console.log('# isAvailable started');

        await this.paypalService.isPayPalSdkReady();

        const paymentMethods = await this.paypalService.sdkInstance.findEligibleMethods({
            currencyCode: this.props.amount.currency,
            countryCode: this.props.countryCode
        });

        if (!paymentMethods.isEligible('venmo')) {
            return Promise.reject();
        }

        console.log('# isAvailable finished');
        return Promise.resolve();
    }

    formatProps(props: PayPalConfiguration): PayPalConfiguration {
        const merchantId = props.configuration?.merchantId;
        const intentFromConfig = props.configuration?.intent;
        const isZeroAuth = props.amount?.value === 0;
        const intent: Intent = isZeroAuth ? 'tokenize' : props.intent || intentFromConfig;
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
                type: VenmoElement.type,
                userAction,
                subtype: isExpress ? 'express' : VenmoElement.subtype
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

            if (this.props.useV6) this.handleResolveV6(action.sdkData.token);
            else this.handleResolve(action.sdkData.token);
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

    private handleOnApprove = (data: any): Promise<void> => {
        const { onAuthorized } = this.props;
        const state = { data: { details: data, paymentData: this.paymentData } };

        if (!onAuthorized) {
            this.handleAdditionalDetails(state);
            return;
        }

        /**
         * TODO: Request profile details from backend if onAuthorized is defined
         */
        this.handleError(new AdyenCheckoutError('ERROR', 'Something went wrong while parsing PayPal Order'));
    };

    handleResolve(token: string) {
        if (!this.resolve) return this.handleError(new AdyenCheckoutError('ERROR', ERRORS.WRONG_INSTANCE));
        this.resolve(token);
    }

    handleResolveV6(token: string) {
        if (!this.resolve) return this.handleError(new AdyenCheckoutError('ERROR', ERRORS.WRONG_INSTANCE));
        const obj = { orderId: token };
        this.resolve(obj);
    }

    handleReject(errorMessage: string) {
        if (!this.reject) return this.handleError(new AdyenCheckoutError('ERROR', ERRORS.WRONG_INSTANCE));
        this.reject(new Error(errorMessage));
    }

    private handleSubmit(): Promise<void> {
        super.submit();

        return new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
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
    private handleOnShippingAddressChange(data: any, actions: any): Promise<void> {
        return this.props.onShippingAddressChange(data, actions, this);
    }

    /**
     * If the merchant provides the 'onShippingOptionsChange' callback, then this method is used as a wrapper to it, in order
     * to expose to the merchant the 'component' instance. The merchant needs the 'component' in order to manipulate the
     * paymentData
     *
     * @param data - PayPal data
     * @param actions - PayPal actions.
     */
    private handleOnShippingOptionsChange(data: any, actions: any): Promise<void> {
        return this.props.onShippingOptionsChange(data, actions, this);
    }

    protected override componentToRender(): h.JSX.Element {
        if (!this.props.showPayButton) return null;

        const { onShippingAddressChange, onShippingOptionsChange, ...rest } = this.props;

        return <VenmoComponent onSubmit={this.handleSubmit} onAdditionalDetails={this.handleOnApprove} paypalService={this.paypalService} />;
    }
}

export default VenmoElement;
