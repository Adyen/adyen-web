import Language from '../language';
import UIElement from '../components/UIElement';
import RiskModule from './RiskModule';
import PaymentMethodsResponse from './ProcessResponse/PaymentMethodsResponse';
import getComponentForAction from './ProcessResponse/PaymentAction';
import { resolveEnvironment, resolveCDNEnvironment } from './Environment';
import Analytics from './Analytics';
import { PaymentAction } from '../types';
import { CoreOptions } from './types';
import { getComponentConfiguration, processGlobalOptions } from './utils';
import Session from './CheckoutSession';
import { hasOwnProperty } from '../utils/hasOwnProperty';
import { Resources } from './Context/Resources';
import { SRPanel } from './Errors/SRPanel';
import registry, { NewableComponent } from './core.registry';
// import type { PaymentMethods, PaymentMethodOptions } from '../components/type-new';

class Core {
    public session: Session;
    public paymentMethodsResponse: PaymentMethodsResponse;
    public modules: any;
    public options: CoreOptions;
    public components = [];
    public loadingContext?: string;
    public cdnContext?: string;

    public static readonly version = {
        version: process.env.VERSION,
        revision: process.env.COMMIT_HASH,
        branch: process.env.COMMIT_BRANCH,
        buildId: process.env.ADYEN_BUILD_ID
    };

    public static registry = registry;

    public static register(...items: NewableComponent[]) {
        registry.add(...items);
    }

    constructor(props: CoreOptions) {
        // this.create = this.create.bind(this);
        this.createFromAction = this.createFromAction.bind(this);

        this.setOptions(props);
        this.createPaymentMethodsList();

        this.loadingContext = resolveEnvironment(this.options.environment);
        this.cdnContext = resolveCDNEnvironment(this.options.resourceEnvironment || this.options.environment);

        const clientKeyType = this.options.clientKey?.substr(0, 4);
        if ((clientKeyType === 'test' || clientKeyType === 'live') && !this.loadingContext.includes(clientKeyType)) {
            throw new Error(`Error: you are using a ${clientKeyType} clientKey against the ${this.options.environment} environment`);
        }

        // Expose version number for npm builds
        window['adyenWebVersion'] = Core.version.version;
    }

    initialize(): Promise<this> {
        if (this.options.session) {
            this.session = new Session(this.options.session, this.options.clientKey, this.loadingContext);

            return this.session
                .setupSession(this.options)
                .then(sessionResponse => {
                    const { amount, shopperLocale, paymentMethods, ...rest } = sessionResponse;

                    this.setOptions({
                        ...rest,
                        amount: this.options.order ? this.options.order.remainingAmount : amount,
                        locale: this.options.locale || shopperLocale
                    });

                    this.createPaymentMethodsList(paymentMethods);
                    this.createCoreModules();

                    return this;
                })
                .catch(error => {
                    if (this.options.onError) this.options.onError(error);
                    return this;
                });
        }

        this.createCoreModules();

        return Promise.resolve(this);
    }

    /**
     * Submits details using onAdditionalDetails or the session flow if available
     * @param details -
     */
    public submitDetails(details): void {
        if (this.options.onAdditionalDetails) {
            return this.options.onAdditionalDetails(details);
        }

        if (this.session) {
            this.session
                .submitDetails(details)
                .then(response => {
                    this.options.onPaymentCompleted?.(response);
                })
                .catch(error => {
                    this.options.onError?.(error);
                });
        }
    }

    /**
     * Instantiates a new UIElement component ready to be mounted
     *
     * @param paymentMethod - either name of the paymentMethod (in theory this can also be a class, but we don't use it this way)
     *  or object extracted from the paymentMethods response .paymentMethods or .storedPaymentMethods (scenario: Dropin creating components for its PM list)
     *
     * @param options - an object whose form varies, can be:
     *  - the merchant defined config object passed when a component is created via checkout.create
     *  - the Dropin created object from Dropin/components/utils.getCommonProps()
     *  - an object extracted from the paymentMethods response .storedPaymentMethods (scenario: standalone storedCard comp)
     *
     * @returns new UIElement
     */
    // public create<T extends keyof PaymentMethods>(paymentMethod: T, options?: PaymentMethodOptions<T>): InstanceType<PaymentMethods[T]>;
    // public create<T extends new (...args: any) => T, P extends ConstructorParameters<T>>(paymentMethod: T, options?: P[0]): T;
    // public create(paymentMethod: string, options?: PaymentMethodOptions<'redirect'>): InstanceType<PaymentMethods['redirect']>;
    // public create(paymentMethod: any, options?: any): any {
    //     const props = this.getPropsForComponent(options);
    //     return paymentMethod ? this.handleCreate(paymentMethod, props) : this.handleCreateError();
    // }

    /**
     * Instantiates a new element component ready to be mounted from an action object
     * @param action - action defining the component with the component data
     * @param options - options that will be merged to the global Checkout props
     * @returns new UIElement
     */
    public createFromAction(action: PaymentAction, options = {}): any {
        if (!action || !action.type) {
            if (hasOwnProperty(action, 'action') && hasOwnProperty(action, 'resultCode')) {
                throw new Error(
                    'createFromAction::Invalid Action - the passed action object itself has an "action" property and ' +
                        'a "resultCode": have you passed in the whole response object by mistake?'
                );
            }
            throw new Error('createFromAction::Invalid Action - the passed action object does not have a "type" property');
        }

        if (action.type) {
            const actionTypeConfiguration = getComponentConfiguration(action.type, this.options.paymentMethodsConfiguration);

            const props = {
                ...processGlobalOptions(this.options),
                ...actionTypeConfiguration,
                ...this.getPropsForComponent(options)
            };

            return getComponentForAction(this, registry, action, props);
        }

        return this.handleCreateError();
    }

    /**
     * Updates global configurations, resets the internal state and remounts each element.
     * @param options - props to update
     * @returns this - the element instance
     */
    public update = (options: CoreOptions = {}): Promise<this> => {
        this.setOptions(options);

        return this.initialize().then(() => {
            // Update each component under this instance
            this.components.forEach(c => c.update(this.getPropsForComponent(this.options)));

            return this;
        });
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
     * Create or update the config object passed when AdyenCheckout is initialised (environment, clientKey, etc...)
     */
    private setOptions = (options: CoreOptions): void => {
        if (hasOwnProperty(options?.paymentMethodsConfiguration, 'scheme')) {
            console.warn(
                'WARNING: You cannot define a property "scheme" on the paymentMethodsConfiguration object - it should be defined as "card" otherwise it will be ignored'
            );
        }

        if (hasOwnProperty(options, 'installmentOptions')) {
            console.warn(
                "WARNING: you are setting installmentOptions directly in the top level configuration object. They should be set via the 'paymentMethodsConfiguration' object or directly on the 'card' component."
            );
        }

        this.options = {
            ...this.options,
            ...options
        };
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
            ...options,
            i18n: this.modules.i18n,
            modules: this.modules,
            session: this.session,
            loadingContext: this.loadingContext,
            cdnContext: this.cdnContext,
            createFromAction: this.createFromAction
        };
    }

    public generateUIElementProps(options: any) {
        const props = this.getPropsForComponent(options);

        const { type, isDropin, supportedShopperInteractions, storedPaymentMethodId } = props;

        /**
         * Find which creation scenario we are in - we need to know when we're creating a Dropin, a PM within the Dropin, or a standalone comp.
         */
        const needsConfigData = type !== 'dropin' && !isDropin;
        const needsPMData = needsConfigData && !supportedShopperInteractions;

        /**
         * We only need to populate the paymentMethodsDetails & paymentMethodsConfiguration objects under certain circumstances.
         * (If we're creating a Dropin or a PM within the Dropin - then the relevant paymentMethods response & paymentMethodsConfiguration props
         * are already merged into the passed options object; whilst a standalone stored card just needs the paymentMethodsConfiguration props)
         * So:
         *  - for a standalone component: needsConfigData = true, needsPMData = true
         *  - for a standalone storedCard component: needsConfigData = true, needsPMData = false
         *  - for Dropin or PM within dropin: needsConfigData = false, needsPMData = false
         */
        const paymentMethodsDetails = needsPMData ? this.paymentMethodsResponse.find(type) : {};
        const paymentMethodsConfiguration = needsConfigData
            ? getComponentConfiguration(type, this.options.paymentMethodsConfiguration, !!storedPaymentMethodId)
            : {};

        // Filtered global options
        const globalOptions = processGlobalOptions(this.options);

        const calculatedOptions = { ...globalOptions, ...paymentMethodsDetails, ...paymentMethodsConfiguration, ...props };

        console.log('\n### core::generateUIElementProps:: props.type', type);
        console.log('### core::generateUIElementProps:: props.isDropin', isDropin);
        console.log('### core::generateUIElementProps:: props.supportedShopperInteractions', supportedShopperInteractions);
        console.log('### core::generateUIElementProps:: needsConfigData', needsConfigData);
        console.log('### core::generateUIElementProps:: needsPMData', needsPMData);

        return calculatedOptions;
    }

    public storeComponentRef(component: UIElement) {
        this.components.push(component);
    }

    /**
     * @internal
     * A recursive creation function that finalises by calling itself with a reference to a valid component class which it then initialises
     *
     * @param PaymentMethod - type varies:
     *  - usually a string
     *  - but for Dropin, when it starts creating payment methods, will be a fully formed object from the paymentMethods response .paymentMethods or .storedPaymentMethods
     *  - always finishes up as a reference to a valid component class
     *
     * @param options - an object whose form varies, it is *always* enhanced with props from this.getPropsForComponent(), and can also be:
     *  - the config object passed when a Component is created via checkout.create('card'|'dropin'|'ideal'|etc..) (scenario: usual first point of entry to this function)
     *  - the internally created props object from Dropin/components/utils.getCommonProps() (scenario: Dropin creating components for its PM list)
     *  - an object extracted from the paymentMethods response .paymentMethods or .storedPaymentMethods (scenarios: Dropin creating components for its PM list *or* standalone storedCard comp)
     *  - a combination of the previous 2 + the relevant object from the paymentMethodsConfiguration (scenario: Dropin creating components for its PM list)
     *
     *
     * @returns new UIElement
     */
    private handleCreate(PaymentMethod, options: any = {}): any {
        const isValidClass = PaymentMethod.prototype instanceof UIElement;

        /**
         * Final entry point (PaymentMethod is a Class):
         * Once we receive a valid class for a Component - create a new instance of it
         */
        if (isValidClass) {
            console.log('### core::handleCreate:: fimal entry point PaymentMethod=', PaymentMethod);
            /**
             * Find which creation scenario we are in - we need to know when we're creating a Dropin, a PM within the Dropin, or a standalone stored card.
             */
            const needsConfigData = options.type !== 'dropin' && !options.isDropin;
            const needsPMData = needsConfigData && !options.supportedShopperInteractions;

            /**
             * We only need to populate the objects under certain circumstances.
             * (If we're creating a Dropin or a PM within the Dropin - then the relevant paymentMethods response & paymentMethodsConfiguration props
             * are already merged into the passed options object; whilst a standalone stored card just needs the paymentMethodsConfiguration props)
             */
            const paymentMethodsDetails = needsPMData ? this.paymentMethodsResponse.find(options.type) : {};
            const paymentMethodsConfiguration = needsConfigData
                ? getComponentConfiguration(options.type, this.options.paymentMethodsConfiguration, !!options.storedPaymentMethodId)
                : {};

            // Filtered global options
            const globalOptions = processGlobalOptions(this.options);

            /**
             * Merge:
             * 1. global options (a subset of the original config object sent when AdyenCheckout is initialised)
             * 2. props defined on the relevant object in the paymentMethods response (will not have a value for the 'dropin' component)
             * 3. a paymentMethodsConfiguration object, if defined at top level (will not have a value for the 'dropin' component)
             * 4. the options that have been passed to the final call of this function (see comment on \@param, above)
             */
            const component = new PaymentMethod({ ...globalOptions, ...paymentMethodsDetails, ...paymentMethodsConfiguration, ...options });

            if (!options.isDropin) {
                this.components.push(component);
            }

            return component;
        }

        /**
         * Usual initial point of entry to this function (PaymentMethod is a String).
         * When PaymentMethod is defined as a string - retrieve a component from the componentsMap and recall this function passing in a valid class
         */
        if (typeof PaymentMethod === 'string' && registry.getComponent(PaymentMethod)) {
            if (PaymentMethod === 'dropin' && hasOwnProperty(options, 'paymentMethodsConfiguration')) {
                console.warn(
                    "WARNING: You are setting a 'paymentMethodsConfiguration' object in the Dropin configuration options. This object will be ignored."
                );
            }
            console.log('### core::handleCreate:: PaymentMethod as string:: type=', PaymentMethod);
            return this.handleCreate(registry.getComponent(PaymentMethod), { type: PaymentMethod, ...options });
        }

        /**
         * Entry point for Redirect PMs (PaymentMethod is a String).
         * If we are trying to create a payment method that is in the paymentMethods response & does not explicitly
         * implement a component (i.e no matching entry in the 'paymentMethods' components map), it will default to a Redirect component
         */
        if (typeof PaymentMethod === 'string' && this.paymentMethodsResponse.has(PaymentMethod)) {
            /**
             * NOTE: Only need the type prop for standalone redirect comps created by checkout.create('\{redirect-pm-txVariant\}'); (a likely scenario?)
             * - in all other scenarios it is already present.
             * (Further details: from the paymentMethods response and paymentMethodsConfiguration are added in the next step,
             *  or, in the Dropin case, are already present)
             */
            return this.handleCreate(registry.getComponent('redirect'), { type: PaymentMethod, ...options });
        }

        /**
         * Entry point from Dropin, as it creates all its PMs.
         * Happens when Dropin has isolated a relevant PaymentMethod object from the paymentMethodsResponse.paymentMethods (or, .storedPaymentMethods)
         *  e.g. PaymentMethod = {"brands": ["mc", "visa", ...etc], "name": "Credit Card", "type": "scheme"}
         * This object is then used to create a UIElement representing a PM in the paymentMethods list
         */
        if (typeof PaymentMethod === 'object' && typeof PaymentMethod.type === 'string') {
            console.log('### core::handleCreate:: Dropin entry point:: PaymentMethod=', PaymentMethod);
            // paymentMethodsConfiguration object will take precedence here
            const paymentMethodsConfiguration = getComponentConfiguration(
                PaymentMethod.type,
                this.options.paymentMethodsConfiguration,
                !!PaymentMethod.storedPaymentMethodId
            );
            // Restart the flow in the "usual" way (PaymentMethod is a String)
            return this.handleCreate(PaymentMethod.type, { ...PaymentMethod, ...options, ...paymentMethodsConfiguration });
        }

        return this.handleCreateError(PaymentMethod);
    }

    public generateUIElementForDropin(PaymentMethodObject, options) {
        console.log('### core::generateUIElementForDropin:: ');
        const paymentMethodsConfiguration = getComponentConfiguration(
            PaymentMethodObject.type,
            this.options.paymentMethodsConfiguration,
            !!PaymentMethodObject.storedPaymentMethodId
        );

        const calculatedUIElementProps = { ...PaymentMethodObject, ...options, ...paymentMethodsConfiguration };

        let PaymentMethod = registry.getComponent(PaymentMethodObject.type);

        /**
         * If we are trying to create a payment method that is in the paymentMethods response but does not explicitly
         * implement a component (i.e. no matching entry in the 'paymentMethods' components map), it will default to a Redirect component
         */
        if (!PaymentMethod && this.paymentMethodsResponse.has(PaymentMethodObject.type)) {
            PaymentMethod = registry.getComponent('redirect');
        }

        return new PaymentMethod(this, calculatedUIElementProps);
    }

    /**
     * @internal
     */
    private handleCreateError(paymentMethod?): never {
        const paymentMethodName = paymentMethod && paymentMethod.name ? paymentMethod.name : 'The passed payment method';
        const errorMessage = paymentMethod
            ? `${paymentMethodName} is not a valid Checkout Component. What was passed as a txVariant was: ${JSON.stringify(
                  paymentMethod
              )}. Check if this payment method is configured in the Backoffice or if the txVariant is a valid one`
            : 'No Payment Method component was passed';

        throw new Error(errorMessage);
    }

    private createPaymentMethodsList(paymentMethodsResponse?: PaymentMethodsResponse): void {
        this.paymentMethodsResponse = new PaymentMethodsResponse(this.options.paymentMethodsResponse || paymentMethodsResponse, this.options);
    }

    private createCoreModules(): void {
        if (this.modules) {
            console.warn('Core: Core modules are already created.');
            return;
        }

        this.modules = Object.freeze({
            risk: new RiskModule({ ...this.options, loadingContext: this.loadingContext }),
            analytics: new Analytics({
                loadingContext: this.loadingContext,
                clientKey: this.options.clientKey,
                locale: this.options.locale,
                analytics: this.options.analytics,
                amount: this.options.amount
            }),
            resources: new Resources(this.cdnContext),
            i18n: new Language(this.options.locale, this.options.translations),
            srPanel: new SRPanel(this.options.srConfig)
        });
    }
}

export default Core;
