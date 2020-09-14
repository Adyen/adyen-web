import Language from '../language';
import UIElement from '../components/UIElement';
import RiskModule from './RiskModule';
import paymentMethods, { getComponentConfiguration } from '../components';
import PaymentMethodsResponse from './ProcessResponse/PaymentMethodsResponse';
import getComponentForAction from './ProcessResponse/PaymentAction';
import resolveEnvironment from './Environment';
import Analytics from './Analytics';
import { PaymentAction } from '../types';
import { CoreOptions } from './types';
import { PaymentMethods, PaymentMethodOptions } from '../types';
import { errorHandler } from './Errors/ErrorHandler';
import { ERROR_CODES, ERROR_MSG_INVALID_PM_NAME, ERROR_MSG_INVALID_COMP } from './Errors/constants';

class Core {
    private paymentMethodsResponse: PaymentMethodsResponse;
    public readonly modules: any;
    public readonly options: any;

    public static readonly version = {
        version: process.env.VERSION,
        revision: process.env.COMMIT_HASH,
        branch: process.env.COMMIT_BRANCH,
        buildId: process.env.ADYEN_BUILD_ID
    };

    constructor(options: CoreOptions = {}) {
        this.options = {
            ...options,
            onErrorRef: options.onError, // Store ref to merchant defined callback (from checkout options)
            onError: errorHandler, // Overwrite prop with reference to central handler
            loadingContext: resolveEnvironment(options.environment)
        };

        this.modules = {
            risk: new RiskModule(this.options),
            analytics: new Analytics(this.options),
            i18n: new Language(options.locale, options.translations)
        };

        this.paymentMethodsResponse = new PaymentMethodsResponse(options.paymentMethodsResponse, this.options);

        this.create = this.create.bind(this);
        this.createFromAction = this.createFromAction.bind(this);
    }

    /**
     * Instantiates a new UIElement component ready to be mounted
     * @param paymentMethod - name or class of the paymentMethod
     * @param options - options that will be merged to the global Checkout props
     * @returns new UIElement
     */
    public create<T extends keyof PaymentMethods>(paymentMethod: T | string, options?: PaymentMethodOptions<T>): InstanceType<PaymentMethods[T]>;
    public create<T extends new (...args: any) => T, P extends ConstructorParameters<T>>(paymentMethod: T, options?: P[0]): T;
    public create(paymentMethod, options) {
        const props = this.getPropsForComponent(options);
        return paymentMethod ? this.handleCreate(paymentMethod, props) : this.handleCreateError();
    }

    /**
     * Instantiates a new element component ready to be mounted from an action object
     * @param action - action defining the component with the component data
     * @param options - options that will be merged to the global Checkout props
     * @returns new UIElement
     */
    public createFromAction(action: PaymentAction, options = {}): UIElement {
        if (action.type) {
            const props = this.getPropsForComponent(options);
            return getComponentForAction(action, props);
        }
        return this.handleCreateError();
    }

    /**
     * @param options - options that will be merged to the global Checkout props
     * @returns props for a new UIElement
     */
    private getPropsForComponent(options) {
        return {
            paymentMethods: this.paymentMethodsResponse.paymentMethods,
            storedPaymentMethods: this.paymentMethodsResponse.storedPaymentMethods,
            ...this.options,
            ...options,
            onErrorRef: options?.onError ? options.onError : this.options.onErrorRef, // Update onErrorRef in case the merchant has defined one in the component options
            onError: this.options.onError, // Overwrite prop with already created reference to central handler
            i18n: this.modules.i18n,
            modules: this.modules,
            createFromAction: this.createFromAction
        };
    }

    /**
     * @internal
     */
    private handleCreate(PaymentMethod, options: any = {}): UIElement {
        const isValidClass = PaymentMethod.prototype instanceof UIElement;

        /**
         * Once we receive a valid class for a Component - create a new instance of it
         */
        if (isValidClass) {
            const paymentMethodsDetails = !options.supportedShopperInteractions ? this.paymentMethodsResponse.find(PaymentMethod.type) : [];

            // NOTE: will only have a value if a paymentMethodsConfiguration object is defined at top level, in the config object set when a
            // new AdyenCheckout is initialised.
            const paymentMethodsConfiguration = getComponentConfiguration(PaymentMethod.type, options.paymentMethodsConfiguration);

            // Merge:
            // 1. props defined on the PaymentMethod in the response object (will not have a value for the 'dropin' component)
            // 2. the combined props of checkout & the configuration object defined on this particular component
            // 3. a paymentMethodsConfiguration object, if defined at top level
            return new PaymentMethod({ ...paymentMethodsDetails, ...options, ...paymentMethodsConfiguration });
        }

        /**
         * Most common use case. Usual initial point of entry to this function.
         * When PaymentMethod is defined as a string - retrieve a component from the componentsMap and recall this function passing in a valid class
         */
        if (typeof PaymentMethod === 'string' && paymentMethods[PaymentMethod]) {
            return this.handleCreate(paymentMethods[PaymentMethod], options);
        }

        /**
         * If we are trying to create a payment method that is in the paymentMethodsResponse & it doesn't require any details - treat it as a redirect
         */
        if (
            typeof PaymentMethod === 'string' &&
            this.paymentMethodsResponse.has(PaymentMethod) &&
            !this.paymentMethodsResponse.find(PaymentMethod).details
        ) {
            const paymentMethodsConfiguration = getComponentConfiguration(PaymentMethod, options.paymentMethodsConfiguration);
            return this.handleCreate(paymentMethods.redirect, {
                ...this.paymentMethodsResponse.find(PaymentMethod),
                ...options,
                ...paymentMethodsConfiguration
            });
        }

        return this.handleCreateError(PaymentMethod);
    }

    /**
     * @internal
     */
    private handleCreateError(paymentMethod?): any {
        const paymentMethodName = paymentMethod && paymentMethod.name ? paymentMethod.name : `The passed payment method "${paymentMethod}"`;
        const errorCode = paymentMethod ? ERROR_CODES[ERROR_MSG_INVALID_PM_NAME] : ERROR_CODES[ERROR_MSG_INVALID_COMP];

        this.options.onError({ error: errorCode, info: paymentMethodName }, this);
    }
}

export default Core;
