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

class Core {
    private paymentMethodsResponse: PaymentMethodsResponse;
    public modules: any;
    public options: any;
    public components = [];

    public static readonly version = {
        version: process.env.VERSION,
        revision: process.env.COMMIT_HASH,
        branch: process.env.COMMIT_BRANCH,
        buildId: process.env.ADYEN_BUILD_ID
    };

    constructor(options: CoreOptions = {}) {
        this.create = this.create.bind(this);
        this.createFromAction = this.createFromAction.bind(this);

        this.setOptions(options);
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
     * Updates global configurations, resets the internal state and remounts each element.
     * @param options - props to update
     * @returns this - the element instance
     */
    public update = (options: CoreOptions = {}): this => {
        this.setOptions(options);

        // Update each component under this instance
        this.components.forEach(c => c.update(this.getPropsForComponent(this.options)));

        return this;
    };

    /**
     * Remove the reference of a component
     * @param component - reference to the component to be removed
     * @returns this - the element instance
     */
    public remove = (component): this => {
        this.components = this.components.filter(c => c._id !== component._id);
        component.unmount();

        return this;
    };

    /**
     * @internal
     * (Re)Initializes core options (i18n, paymentMethodsResponse, etc...)
     * @param options
     * @returns this
     */
    private setOptions = (options): this => {
        this.options = { ...this.options, ...options };
        this.options.loadingContext = resolveEnvironment(this.options.environment);

        this.modules = {
            risk: new RiskModule(this.options),
            analytics: new Analytics(this.options),
            i18n: new Language(this.options.locale, this.options.translations)
        };

        this.paymentMethodsResponse = new PaymentMethodsResponse(this.options.paymentMethodsResponse, this.options);

        return this;
    };

    /**
     * @internal
     * @param options - options that will be merged to the global Checkout props
     * @returns props for a new UIElement
     */
    private getPropsForComponent(options) {
        return {
            paymentMethods: this.paymentMethodsResponse.paymentMethods,
            storedPaymentMethods: this.paymentMethodsResponse.storedPaymentMethods,
            ...this.options,
            ...options,
            i18n: this.modules.i18n,
            modules: this.modules,
            createFromAction: this.createFromAction,
            _parentInstance: this
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
            const component = new PaymentMethod({ ...paymentMethodsDetails, ...options, ...paymentMethodsConfiguration });
            this.components.push(component);
            return component;
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
    private handleCreateError(paymentMethod?): never {
        const paymentMethodName = paymentMethod && paymentMethod.name ? paymentMethod.name : 'The passed payment method';
        const errorMessage = paymentMethod ? `${paymentMethodName} is not a valid Checkout Component` : 'No Payment Method component was passed';

        throw new Error(errorMessage);
    }
}

export default Core;
