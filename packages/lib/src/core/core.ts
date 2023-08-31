import Language from '../language';
import UIElement from '../components/UIElement';
import RiskModule from './RiskModule';
import PaymentMethodsResponse from './ProcessResponse/PaymentMethodsResponse';
import getComponentForAction from './ProcessResponse/PaymentAction';
import { resolveEnvironment, resolveCDNEnvironment } from './Environment';
import Analytics from './Analytics';
import { PaymentAction } from '../types';
import { CoreOptions, PaymentMethodsConfiguration } from './types';
import { getComponentConfiguration, processGlobalOptions } from './utils';
import Session from './CheckoutSession';
import { hasOwnProperty } from '../utils/hasOwnProperty';
import { Resources } from './Context/Resources';
import { SRPanel } from './Errors/SRPanel';
import registry, { NewableComponent } from './core.registry';

class Core {
    public session: Session;
    public paymentMethodsResponse: PaymentMethodsResponse;
    public modules: any;
    public options: CoreOptions;
    public loadingContext?: string;
    public cdnContext?: string;

    private elements: UIElement[] = [];
    private paymentMethodsConfiguration: PaymentMethodsConfiguration = {};

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

    public getComponent(txVariant: string) {
        return registry.getComponent(txVariant);
    }

    constructor(props: CoreOptions) {
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
     * Instantiates a new element component ready to be mounted from an action object
     *
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
            // If it is threeDS, then it would need to fetch from Card
            const actionTypeConfiguration = getComponentConfiguration(action.type, this.paymentMethodsConfiguration);

            const props = {
                ...this.getCorePropsForComponent(),
                ...actionTypeConfiguration,
                ...options
            };

            return getComponentForAction(this, registry, action, props);
        }

        return this.handleCreateError();
    }

    /**
     * Updates global configurations, resets the internal state and remounts each element.
     *
     * @param options - props to update
     * @returns this - the element instance
     */
    public update = (options: CoreOptions = {}): Promise<this> => {
        this.setOptions(options);

        return this.initialize().then(() => {
            // Update each component under this instance
            this.elements.forEach(c => c.update(this.getCorePropsForComponent()));
            return this;
        });
    };

    /**
     * Remove the reference of a component
     * @param component - reference to the component to be removed
     * @returns this - the element instance
     * // TODO: Do we need this?
     */
    public remove = (component): this => {
        this.elements = this.elements.filter(c => c._id !== component._id);
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
     * @returns props for a new UIElement
     */
    public getCorePropsForComponent() {
        const globalOptions = processGlobalOptions(this.options);

        return {
            ...globalOptions,
            i18n: this.modules.i18n,
            modules: this.modules,
            session: this.session,
            loadingContext: this.loadingContext,
            cdnContext: this.cdnContext,
            createFromAction: this.createFromAction
        };
    }

    public updatePaymentMethodsConfiguration(paymentMethodConfiguration: PaymentMethodsConfiguration = {}) {
        this.paymentMethodsConfiguration = {
            ...this.paymentMethodsConfiguration,
            ...paymentMethodConfiguration
        };
    }

    public storeElementReference(element: UIElement) {
        this.elements.push(element);
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
            risk: new RiskModule({ ...this.options, loadingContext: this.loadingContext, core: this }),
            analytics: new Analytics({
                loadingContext: this.loadingContext,
                clientKey: this.options.clientKey,
                locale: this.options.locale,
                analytics: this.options.analytics,
                amount: this.options.amount
            }),
            resources: new Resources(this.cdnContext),
            i18n: new Language(this.options.locale, this.options.translations),
            srPanel: new SRPanel({ core: this, ...this.options.srConfig })
        });
    }
}

export default Core;
