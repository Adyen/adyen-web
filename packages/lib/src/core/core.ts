import Language from '../language';
import UIElement from '../components/internal/UIElement/UIElement';
import RiskModule from './RiskModule';
import PaymentMethods from './ProcessResponse/PaymentMethods';
import getComponentForAction from './ProcessResponse/PaymentAction';
import Analytics from './Analytics';
import { assertConfigurationPropertiesAreValid, processGlobalOptions } from './utils';
import Session from './CheckoutSession';
import { hasOwnProperty } from '../utils/hasOwnProperty';
import { Resources } from './Context/Resources';
import { SRPanel } from './Errors/SRPanel';
import registry, { NewableComponent } from './core.registry';
import { cleanupFinalResult, sanitizeResponse, verifyPaymentDidNotFail } from '../components/internal/UIElement/utils';
import AdyenCheckoutError, { IMPLEMENTATION_ERROR } from './Errors/AdyenCheckoutError';
import { ANALYTICS_ACTION_STR } from './Analytics/constants';
import { THREEDS2_FULL } from '../components/ThreeDS2/constants';
import { DEFAULT_LOCALE } from '../language/constants';
import getTranslations from './Services/get-translations';
import { defaultProps } from './core.defaultProps';
import { formatCustomTranslations, formatLocale } from '../language/utils';
import { resolveEnvironments } from './Environment';
import { LIBRARY_BUNDLE_TYPE, LIBRARY_VERSION } from './config';

import type { PaymentAction, PaymentResponseData } from '../types/global-types';
import type { CoreConfiguration, ICore, AdditionalDetailsData, CoreModules } from './types';
import type { Translations } from '../language/types';
import type { UIElementProps } from '../components/internal/UIElement/types';
import { AnalyticsLogEvent } from './Analytics/AnalyticsLogEvent';
import CancelError from './Errors/CancelError';

class Core implements ICore {
    public session?: Session;
    public paymentMethodsResponse: PaymentMethods;
    public modules: CoreModules;
    public options: CoreConfiguration;

    public analyticsContext: string;
    public loadingContext: string;
    public cdnImagesUrl: string;
    public cdnTranslationsUrl: string;

    private components: UIElement[] = [];

    public static readonly metadata = {
        version: LIBRARY_VERSION,
        bundleType: LIBRARY_BUNDLE_TYPE
    };

    public static registry = registry;

    public static setBundleType(type: string): void {
        Core.metadata.bundleType = type;
    }

    public static register(...items: NewableComponent[]) {
        registry.add(...items);
    }

    /**
     * Used internally by the PaymentMethod components to auto-register themselves
     * @internal
     */
    public register(...items: NewableComponent[]) {
        registry.add(...items);
    }

    public getComponent(txVariant: string) {
        return registry.getComponent(txVariant);
    }

    constructor(props: CoreConfiguration) {
        assertConfigurationPropertiesAreValid(props);

        this.createFromAction = this.createFromAction.bind(this);

        this.setOptions({ ...defaultProps, ...props });

        const { apiUrl, analyticsUrl, cdnImagesUrl, cdnTranslationsUrl } = resolveEnvironments(
            this.options.environment,
            this.options._environmentUrls
        );

        this.loadingContext = apiUrl;
        this.analyticsContext = analyticsUrl;
        this.cdnImagesUrl = cdnImagesUrl;
        this.cdnTranslationsUrl = cdnTranslationsUrl;

        this.session = this.options.session && new Session(this.options.session, this.options.clientKey, this.loadingContext);

        const clientKeyType = this.options.clientKey?.substring(0, 4);
        if ((clientKeyType === 'test' || clientKeyType === 'live') && !this.loadingContext.includes(clientKeyType)) {
            throw new AdyenCheckoutError(
                'IMPLEMENTATION_ERROR',
                `Error: you are using a ${clientKeyType} clientKey against the ${this.options._environmentUrls?.api || this.options.environment} environment`
            );
        }
        if (clientKeyType === 'pub.') {
            console.debug(
                `The value you are passing as your "clientKey" looks like an originKey (${this.options.clientKey?.substring(0, 12)}..). Although this is supported it is not the recommended way to integrate. To generate a clientKey, see the documentation (https://docs.adyen.com/development-resources/client-side-authentication/migrate-from-origin-key-to-client-key/) for more details.`
            );
        }

        if (this.options.exposeLibraryMetadata) {
            window['AdyenWebMetadata'] = Core.metadata;
        }
    }

    public async initialize(): Promise<this> {
        await this.initializeCore();
        this.validateCoreConfiguration();
        await this.createCoreModules();
        return this;
    }

    private async initializeCore(): Promise<this> {
        if (this.session) {
            return this.session
                .setupSession(this.options)
                .then(sessionResponse => {
                    const { amount, shopperLocale, countryCode, paymentMethods, ...rest } = sessionResponse;

                    this.setOptions({
                        ...rest,
                        amount: this.options.order ? this.options.order.remainingAmount : amount,
                        locale: this.options.locale || shopperLocale,
                        countryCode: this.options.countryCode || countryCode
                    });

                    this.createPaymentMethodsList(paymentMethods);

                    return this;
                })
                .catch(error => {
                    if (this.options.onError) this.options.onError(error);
                    return Promise.reject(error);
                });
        }

        this.createPaymentMethodsList();
        return Promise.resolve(this);
    }

    private async fetchLocaleTranslations(): Promise<Translations> {
        try {
            return await getTranslations(this.cdnTranslationsUrl, Core.metadata.version, this.options.locale);
        } catch (error: unknown) {
            if (error instanceof AdyenCheckoutError) this.options.onError?.(error);
            else this.options.onError?.(new AdyenCheckoutError('ERROR', 'Failed to fetch translation', { cause: error }));
        }
    }

    private validateCoreConfiguration(): void {
        // @ts-ignore This property does not exist, although merchants might be using when migrating from v5 to v6
        if (this.options.paymentMethodsConfiguration) {
            console.warn('WARNING:  "paymentMethodsConfiguration" is supported only by Drop-in.');
        }

        if (!this.options.countryCode) {
            throw new AdyenCheckoutError(IMPLEMENTATION_ERROR, 'You must specify a countryCode when initializing checkout.');
        }

        if (!this.options.locale) {
            this.setOptions({ locale: DEFAULT_LOCALE });
        }

        this.options.locale = formatLocale(this.options.locale);
        this.options.translations = formatCustomTranslations(this.options.translations);
    }

    /**
     * Method used when handling redirects. It submits details using 'onAdditionalDetails' or the Sessions flow if available.
     *
     * @public
     * @see {https://docs.adyen.com/online-payments/build-your-integration/?platform=Web&integration=Components&version=5.55.1#handle-the-redirect}
     * @param details - Details object containing the redirectResult
     */
    public submitDetails(details: AdditionalDetailsData['data']): void {
        let promise = null;

        if (this.options.onAdditionalDetails) {
            promise = new Promise((resolve, reject) => {
                this.options.onAdditionalDetails({ data: details }, undefined, { resolve, reject });
            });
        }

        if (this.session) {
            promise = this.session.submitDetails(details).catch(error => {
                this.options.onError?.(error);
                return Promise.reject(error);
            });
        }

        if (!promise) {
            this.options.onError?.(
                new AdyenCheckoutError(
                    'IMPLEMENTATION_ERROR',
                    'It can not submit the details. The callback "onAdditionalDetails" or the Session is not setup correctly.'
                )
            );
            return;
        }

        promise
            .then(sanitizeResponse)
            .then(verifyPaymentDidNotFail)
            .then(this.afterAdditionalDetails)
            .then((response: PaymentResponseData) => {
                cleanupFinalResult(response);
                this.options.onPaymentCompleted?.(response);
            })
            .catch((e: PaymentResponseData | Error) => {
                if (e instanceof CancelError) {
                    return;
                }

                cleanupFinalResult(e as PaymentResponseData);
                this.options.onPaymentFailed?.(e as PaymentResponseData);
            });
    }

    private readonly afterAdditionalDetails = (response: PaymentResponseData): Promise<PaymentResponseData | Error> => {
        /**
         * After the user is redirected back, a request to `/details` or `/paymentDetails` will be made.
         * Typically, the response will not include an action object, except for the case of `paybybank_pix` payment method.
         * In terms of `paybybank_pix`, the action UIElement will be created and passed to the `afterAdditionalDetails` callback, allowing it to be mounted on the page.
         */
        if (this.options.afterAdditionalDetails && response?.action) {
            const actionEle = this.createFromAction(response.action);
            this.options.afterAdditionalDetails(actionEle);
            return Promise.reject(new CancelError('Handled by afterAdditionalDetails'));
        }
        return Promise.resolve(response);
    };

    /**
     * Instantiates a new element component ready to be mounted from an action object
     *
     * @param action - action defining the component with the component data
     * @param options - options that will be merged to the global Checkout props
     * @returns new UIElement
     */
    public createFromAction(action: PaymentAction, options = {}): UIElement {
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
            // 'threeDS2' OR 'qrCode', 'voucher', 'redirect', 'await', 'bankTransfer`
            const component = action.type === THREEDS2_FULL ? `${action.type}${action.subtype}` : action.paymentMethodType;

            const event = new AnalyticsLogEvent({
                type: ANALYTICS_ACTION_STR,
                subType: action.type,
                message: `${component} action was handled by the SDK`,
                component
            });
            this.modules.analytics.sendAnalytics(event);

            const props = {
                ...this.getCorePropsForComponent(),
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
    public update = (options: Partial<CoreConfiguration> = {}): Promise<this> => {
        this.setOptions(options);

        return this.initialize().then(() => {
            this.components.forEach(component => {
                // We update only with the new options that have been received
                const newProps: Partial<UIElementProps> = {
                    ...options,
                    ...(this.session && { session: this.session })
                };
                component.update(newProps);
            });
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
        this.components = this.components.filter(c => c._id !== component._id);
        component.unmount();

        return this;
    };

    /**
     * @internal
     * Create or update the config object passed when AdyenCheckout is initialised (environment, clientKey, etc...)
     */
    private setOptions = (options: CoreConfiguration): void => {
        this.options = {
            ...this.options,
            ...options,
            locale: options?.locale || this.options?.locale
        };
    };

    /**
     * @internal
     * @returns props for a new UIElement
     */
    public getCorePropsForComponent(): any {
        const globalOptions = processGlobalOptions(this.options);

        return {
            ...globalOptions,
            core: this,
            i18n: this.modules.i18n,
            modules: this.modules,
            session: this.session,
            loadingContext: this.loadingContext,
            cdnContext: this.cdnImagesUrl,
            createFromAction: this.createFromAction
        };
    }

    public storeElementReference(element: UIElement) {
        if (element) {
            this.components.push(element);
        }
    }

    /**
     * @internal
     */
    private handleCreateError(paymentMethod?): never {
        const paymentMethodName = paymentMethod?.name ?? 'The passed payment method';
        const errorMessage = paymentMethod
            ? `${paymentMethodName} is not a valid Checkout Component. What was passed as a txVariant was: ${JSON.stringify(
                  paymentMethod
              )}. Check if this payment method is configured in the Backoffice or if the txVariant is a valid one`
            : 'No Payment Method component was passed';

        throw new Error(errorMessage);
    }

    private createPaymentMethodsList(paymentMethodsResponse?: PaymentMethods): void {
        this.paymentMethodsResponse = new PaymentMethods(this.options.paymentMethodsResponse || paymentMethodsResponse, this.options);
    }

    private async createCoreModules(): Promise<void> {
        if (this.modules) {
            if (process.env.NODE_ENV === 'development') {
                console.warn('Core: Core modules are already created.');
            }
            return;
        }

        const translations = await this.fetchLocaleTranslations();

        this.modules = Object.freeze({
            risk: new RiskModule(this, { ...this.options, loadingContext: this.loadingContext }),
            analytics: Analytics({
                analyticsContext: this.analyticsContext,
                clientKey: this.options.clientKey,
                locale: this.options.locale,
                analytics: this.options.analytics
            }),
            resources: new Resources(this.cdnImagesUrl),
            i18n: new Language({
                locale: this.options.locale,
                translations,
                customTranslations: this.options.translations
            }),
            srPanel: new SRPanel(this, { ...this.options.srConfig })
        });
    }
}

export default Core;
