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
    private readonly forceConsentDetails: boolean;

    private fastlaneSdk?: FastlaneWindowInstance;
    private latestShopperDetails?: { email: string; customerId: string };
    private fastlaneSessionId?: string;

    constructor(configuration: FastlaneSDKConfiguration) {
        if (!configuration?.environment) throw new AdyenCheckoutError('IMPLEMENTATION_ERROR', "FastlaneSDK: 'environment' property is required");
        if (!configuration?.clientKey) throw new AdyenCheckoutError('IMPLEMENTATION_ERROR', "FastlaneSDK: 'clientKey' property is required");

        if (configuration.forceConsentDetails && configuration.environment.includes('live'))
            console.warn("Fastlane SDK: 'forceConsentDetails' should not be used on 'live' environment");

        const { apiUrl } = resolveEnvironments(configuration.environment);

        this.checkoutShopperURL = apiUrl;
        this.clientKey = configuration.clientKey;
        this.forceConsentDetails = configuration.forceConsentDetails || false;
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
            throw new AdyenCheckoutError('IMPLEMENTATION_ERROR', 'authenticate(): Fastlane SDK is not initialized');
        }

        const { customerContextId } = await this.fastlaneSdk.identity.lookupCustomerByEmail(email);

        if (customerContextId) {
            this.latestShopperDetails = { email, customerId: customerContextId };
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
            const hasCard = !!authResult.profileData?.card;

            if (!hasCard) {
                throw new AdyenCheckoutError('ERROR', 'getComponentConfiguration(): There is no card associated with the authenticated profile');
            }

            return {
                paymentType: 'fastlane',
                configuration: {
                    fastlaneSessionId: this.fastlaneSessionId,
                    email: this.latestShopperDetails.email,
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
        return this.fastlaneSdk.profile.showShippingAddressSelector();
    }

    /**
     * Render the "Fastlane by PayPal" logo in the specified HTML container
     */
    public async mountWatermark(container: HTMLElement | string, options = { includeAdditionalInfo: true }): Promise<void> {
        const component = await this.fastlaneSdk.FastlaneWatermarkComponent(options);
        component.render(container);
    }

    private requestClientToken(): Promise<FastlaneTokenData> {
        return requestFastlaneToken(this.checkoutShopperURL, this.clientKey);
    }

    private async fetchSdk(clientToken: string, clientId: string): Promise<void> {
        const url = `https://www.paypal.com/sdk/js?client-id=${clientId}&components=buttons,fastlane`;
        const script = new Script(url, 'body', {}, { sdkClientToken: clientToken });

        await script.load();
    }

    /**
     * Fetch the fastlane session ID used internally by PayPal for Network Token Usage event
     * This ID is not critical for the payment processing part
     *
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
            return await consentComponent.getRenderState();
        } catch (error) {
            throw new AdyenCheckoutError('ERROR', 'fetchConsentDetails(): failed to fetch consent details', { cause: error });
        }
    }

    private async initializeFastlaneInstance(): Promise<void> {
        try {
            this.fastlaneSdk = await window.paypal.Fastlane({
                intendedExperience: 'externalProcessorCustomConsent',
                ...(this.forceConsentDetails && {
                    metadata: {
                        geoLocOverride: 'US'
                    }
                })
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
