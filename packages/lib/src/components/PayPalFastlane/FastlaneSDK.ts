import { resolveEnvironments } from '../../core/Environment';
import requestFastlaneToken from './services/request-fastlane-token';
import { convertAdyenLocaleToFastlaneLocale } from './utils/convert-locale';
import Script from '../../utils/Script';
import AdyenCheckoutError from '../../core/Errors/AdyenCheckoutError';
import type {
    FastlanePaymentMethodConfiguration,
    FastlaneWindowInstance,
    FastlaneAuthenticatedCustomerResult,
    FastlaneShippingAddressSelectorResult,
    FastlaneSDKConfiguration,
    FastlaneConsentRenderState
} from './types';
import type { FastlaneTokenData } from './services/request-fastlane-token';

class FastlaneSDK {
    private readonly clientKey: string;
    private readonly checkoutShopperURL: string;
    private readonly locale: string;

    private fastlaneSdk: FastlaneWindowInstance;
    private authenticatedShopper: { email: string; customerContextId: string };
    private fastlaneSessionId?: string;

    constructor(configuration: FastlaneSDKConfiguration) {
        if (!configuration.environment) throw new AdyenCheckoutError('IMPLEMENTATION_ERROR', "FastlaneSDK: 'environment' property is required");
        if (!configuration.clientKey) throw new AdyenCheckoutError('IMPLEMENTATION_ERROR', "FastlaneSDK: 'clientKey' property is required");

        const { apiUrl } = resolveEnvironments(configuration.environment);

        this.checkoutShopperURL = apiUrl;
        this.clientKey = configuration.clientKey;
        this.locale = convertAdyenLocaleToFastlaneLocale(configuration.locale || 'en-US');
    }

    /**
     * Initializes the Fastlane SDK
     */
    public async initialize(): Promise<FastlaneSDK> {
        const tokenData = await this.requestClientToken();
        await this.fetchSdk(tokenData.value, tokenData.clientId);
        await this.initializeFastlaneInstance();
        return this;
    }

    /**
     * Triggers the authentication for Fastlane using shopper's email.
     * If shopper is recognized, the OTP flow is initialized.
     *
     * @param email
     */
    public async authenticate(email: string): Promise<FastlaneAuthenticatedCustomerResult> {
        if (!this.fastlaneSdk) {
            throw new AdyenCheckoutError('IMPLEMENTATION_ERROR', 'FastlaneSDK is not initialized');
        }

        const { customerContextId } = await this.fastlaneSdk.identity.lookupCustomerByEmail(email);

        if (customerContextId) {
            this.authenticatedShopper = { email, customerContextId };
            return this.fastlaneSdk.identity.triggerAuthenticationFlow(customerContextId);
        } else {
            return {
                authenticationState: 'not_found',
                profileData: undefined
            };
        }
    }

    /**
     * Creates the Adyen Component configuration based on the Fastlane authentication result.
     *
     * In case the shopper authenticated successfully, it returns config to be used in the Fastlane component
     * Otherwise, it returns the configuration to be used in the Card component
     *
     * @param authResult
     */
    public async getComponentConfiguration(authResult: FastlaneAuthenticatedCustomerResult): Promise<FastlanePaymentMethodConfiguration> {
        if (!authResult) {
            throw new AdyenCheckoutError(
                'IMPLEMENTATION_ERROR',
                'FastlaneSDK: you must pass the authentication result to get the component configuration'
            );
        }

        if (authResult.authenticationState === 'succeeded') {
            return {
                paymentType: 'fastlane',
                configuration: {
                    fastlaneSessionId: this.fastlaneSessionId,
                    email: this.authenticatedShopper.email,
                    tokenId: authResult.profileData.card.id,
                    lastFour: authResult.profileData.card.paymentSource.card.lastDigits,
                    brand: authResult.profileData.card.paymentSource.card.brand.toLowerCase()
                }
            };
        } else {
            const consentDetails = await this.fetchConsentDetails();
            return {
                paymentType: 'card',
                configuration: {
                    ...(consentDetails && {
                        fastlaneConfiguration: {
                            fastlaneSessionId: this.fastlaneSessionId,
                            ...consentDetails
                        }
                    })
                }
            };
        }
    }

    /**
     * Displays the Fastlane Shipping Address selector UI
     */
    public showShippingAddressSelector(): Promise<FastlaneShippingAddressSelectorResult> {
        if (!this.fastlaneSdk) {
            throw new AdyenCheckoutError('IMPLEMENTATION_ERROR', 'FastlaneSDK is not initialized');
        }
        return this.fastlaneSdk.profile.showShippingAddressSelector();
    }

    /**
     * Render the "Fastlane by PayPal" logo in the specified HTML container
     */
    public async mountWatermark(container: HTMLElement | string, options = { includeAdditionalInfo: false }): Promise<void> {
        if (!this.fastlaneSdk) {
            throw new AdyenCheckoutError('IMPLEMENTATION_ERROR', 'FastlaneSDK is not initialized');
        }
        const component = await this.fastlaneSdk.FastlaneWatermarkComponent(options);
        component.render(container);
    }

    private requestClientToken(): Promise<FastlaneTokenData> {
        return requestFastlaneToken(this.checkoutShopperURL, this.clientKey);
    }

    private async fetchSdk(clientToken: string, clientId: string): Promise<void> {
        const url = `https://www.paypal.com/sdk/js?client-id=${clientId}&components=buttons,fastlane`;
        const script = new Script(url, 'body', {}, { sdkClientToken: clientToken });

        try {
            await script.load();
        } catch (error) {
            throw new AdyenCheckoutError('SCRIPT_ERROR', 'FastlaneSDK failed to load', { cause: error });
        }
    }

    /**
     * Fetch the fastlane session ID used internally by PayPal for Network Token Usage event
     * @private
     */
    private async fetchSessionIdAsync(): Promise<void> {
        try {
            const { sessionId } = await this.fastlaneSdk.identity.getSession();
            this.fastlaneSessionId = sessionId;
        } catch (error) {
            console.warn('Fastlane SDK: Failed to fetch session ID', error);
        }
    }

    /**
     * Fetch object containing that details that will be used to display the sign-up UI
     * inside the card component
     * @private
     */
    private async fetchConsentDetails(): Promise<FastlaneConsentRenderState> {
        try {
            const consentComponent = await this.fastlaneSdk.ConsentComponent();
            const consentDetails = await consentComponent.getRenderState();
            return consentDetails;
        } catch (error) {
            console.warn('Fastlane SDK: Failed to fetch consent details', error);
        }
    }

    private async initializeFastlaneInstance(): Promise<void> {
        try {
            this.fastlaneSdk = await window.paypal.Fastlane({
                intendedExperience: 'externalProcessorCustomConsent'
            });
            this.fastlaneSdk.setLocale(this.locale);

            void this.fetchSessionIdAsync();
        } catch (error) {
            throw new AdyenCheckoutError('ERROR', 'Fastlane SDK: Failed to initialize fastlane using the window.paypal.Fastlane constructor', {
                cause: error
            });
        }
    }
}

export default FastlaneSDK;
