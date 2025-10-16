import { resolveEnvironments } from '../../core/Environment';
import type { FastlaneTokenData } from './services/request-fastlane-token';
import requestFastlaneToken from './services/request-fastlane-token';
import { convertAdyenLocaleToFastlaneLocale } from './utils/convert-locale';
import Script from '../../utils/Script';
import AdyenCheckoutError from '../../core/Errors/AdyenCheckoutError';
import {
    FastlaneAuthenticatedCustomerResult,
    FastlaneConsentRenderState,
    FastlanePaymentMethodConfiguration,
    FastlaneSDKConfiguration,
    FastlaneShippingAddressSelectorResult,
    FastlaneSignupConfiguration,
    FastlaneWindowInstance
} from './types';

import Analytics from '../../core/Analytics';
import { AnalyticsInfoEvent, InfoEventType } from '../../core/Analytics/AnalyticsInfoEvent';
import type { AnalyticsModule } from '../../types/global-types';

class FastlaneSDK {
    private readonly clientKey: string;
    private readonly checkoutShopperURL: string;
    private readonly fastlaneLocale: string;
    private readonly forceConsentDetails: boolean;

    private readonly analytics: AnalyticsModule;

    private fastlaneSdk?: FastlaneWindowInstance;
    private latestShopperDetails?: { email: string; customerId: string };
    private fastlaneSessionId?: string;

    constructor(configuration: FastlaneSDKConfiguration) {
        if (!configuration?.environment) throw new AdyenCheckoutError('IMPLEMENTATION_ERROR', "FastlaneSDK: 'environment' property is required");
        if (!configuration?.clientKey) throw new AdyenCheckoutError('IMPLEMENTATION_ERROR', "FastlaneSDK: 'clientKey' property is required");

        if (configuration.forceConsentDetails && configuration.environment.includes('live'))
            console.warn("Fastlane SDK: 'forceConsentDetails' should not be used on 'live' environment");

        const { apiUrl, analyticsUrl } = resolveEnvironments(configuration.environment);

        this.checkoutShopperURL = apiUrl;
        this.clientKey = configuration.clientKey;
        this.forceConsentDetails = configuration.forceConsentDetails || false;
        this.fastlaneLocale = convertAdyenLocaleToFastlaneLocale(configuration.locale || 'en-US');

        this.analytics = Analytics({
            analytics: configuration.analytics,
            locale: configuration.locale || 'en-US',
            analyticsContext: analyticsUrl,
            clientKey: this.clientKey
        });

        document.addEventListener('visibilitychange', this.handlePageVisibilityChanges);
    }

    /**
     * Initializes the Fastlane SDK
     */
    public async initialize(): Promise<FastlaneSDK> {
        void this.analytics.setUp({
            checkoutStage: 'precheckout'
        });

        const tokenData = await this.requestClientToken();
        await this.fetchSdk(tokenData.value, tokenData.clientId);
        await this.initializeFastlaneInstance();
        this.trackEvent(InfoEventType.Initialized);
        return this;
    }

    public destroy(): void {
        document.removeEventListener('visibilitychange', this.handlePageVisibilityChanges);
        this.analytics.flush();
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

        this.trackEvent(InfoEventType.LookupStarted);

        try {
            const { customerContextId } = await this.fastlaneSdk.identity.lookupCustomerByEmail(email);

            if (customerContextId) {
                this.latestShopperDetails = { email, customerId: customerContextId };
                this.trackEvent(InfoEventType.OtpStarted);

                const authResult = await this.fastlaneSdk.identity.triggerAuthenticationFlow(customerContextId);
                this.trackEvent(this.getOtpAnalyticsSubtype(authResult.authenticationState));

                return authResult;
            }

            this.trackEvent(InfoEventType.LookupUserNotFound);
            return {
                authenticationState: 'not_found',
                profileData: undefined
            };
        } catch (error: unknown) {
            throw new AdyenCheckoutError('ERROR', 'Fastlane SDK: An error occurred during the authentication flow.', { cause: error });
        }
    }

    /**
     * Creates the Component configuration based on the Fastlane authentication result.
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

        this.analytics.flush();

        const isAuthSuccess = authResult.authenticationState === 'succeeded';
        const hasCardData = !!authResult.profileData?.card;
        const hasShopperDetails = !!this.latestShopperDetails?.email;

        if (isAuthSuccess && hasCardData && hasShopperDetails) {
            return this.createFastlaneComponentConfiguration(authResult);
        }

        return this.createCardComponentConfiguration();
    }

    /**
     * Displays the Fastlane Shipping Address selector UI
     */
    public async showShippingAddressSelector(): Promise<FastlaneShippingAddressSelectorResult> {
        if (!this.fastlaneSdk) {
            throw new AdyenCheckoutError('IMPLEMENTATION_ERROR', 'showShippingAddressSelector(): Fastlane SDK is not initialized');
        }

        this.trackEvent(InfoEventType.AddressSelectorClicked);

        try {
            const addressSelectorResult = await this.fastlaneSdk.profile.showShippingAddressSelector();
            if (addressSelectorResult.selectionChanged) {
                this.trackEvent(InfoEventType.AddressChanged);
            }
            this.trackEvent(InfoEventType.AddressSelectorClosed);

            return addressSelectorResult;
        } catch (error: unknown) {
            throw new AdyenCheckoutError('ERROR', 'Fastlane SDK: An error occurred when showing the shipping address selector', { cause: error });
        }
    }

    /**
     * Render the "Fastlane by PayPal" logo in the specified HTML container
     */
    public async mountWatermark(container: HTMLElement | string, options = { includeAdditionalInfo: true }): Promise<void> {
        if (!this.fastlaneSdk) {
            throw new AdyenCheckoutError('IMPLEMENTATION_ERROR', 'mountWatermark(): Fastlane SDK is not initialized');
        }

        try {
            const component = await this.fastlaneSdk.FastlaneWatermarkComponent(options);
            component.render(container);
        } catch (error: unknown) {
            throw new AdyenCheckoutError('ERROR', 'Fastlane SDK: An error occurred when rendering the watermark', { cause: error });
        }
    }

    private requestClientToken(): Promise<FastlaneTokenData> {
        return requestFastlaneToken(this.checkoutShopperURL, this.clientKey);
    }

    private async fetchSdk(clientToken: string, clientId: string): Promise<void> {
        const sdkUrl = new URL('https://www.paypal.com/sdk/js');
        sdkUrl.searchParams.set('client-id', clientId);
        sdkUrl.searchParams.set('components', 'buttons,fastlane');

        const script = new Script({
            src: sdkUrl.href,
            component: 'fastlane',
            dataAttributes: { sdkClientToken: clientToken },
            analytics: this.analytics
        });

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
            this.fastlaneSdk.setLocale(this.fastlaneLocale);

            void this.fetchSessionIdAsync();
        } catch (error) {
            throw new AdyenCheckoutError('ERROR', 'Fastlane SDK: Failed to initialize fastlane using the window.paypal.Fastlane constructor', {
                cause: error
            });
        }
    }

    /**
     * Creates the configuration for the Fastlane component
     *
     * @param authResult
     * @private
     */
    private createFastlaneComponentConfiguration(authResult: FastlaneAuthenticatedCustomerResult): FastlanePaymentMethodConfiguration {
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
    }

    /**
     * Creates the configuration for the Card component, including Fastlane sign-up details if available
     *
     * @private
     */
    private async createCardComponentConfiguration(): Promise<FastlanePaymentMethodConfiguration> {
        const consentDetails = await this.fetchConsentDetails();
        const configuration: { fastlaneConfiguration?: FastlaneSignupConfiguration } = {};

        if (consentDetails) {
            configuration.fastlaneConfiguration = {
                fastlaneSessionId: this.fastlaneSessionId,
                ...consentDetails
            };
        }

        return {
            paymentType: 'card',
            configuration
        };
    }

    private trackEvent(eventType: InfoEventType): void {
        const event = new AnalyticsInfoEvent({ type: eventType, component: 'fastlane' });
        this.analytics.sendAnalytics(event);
    }

    private handlePageVisibilityChanges = (): void => {
        if (document.visibilityState === 'hidden') {
            this.analytics.flush();
        }
    };

    /**
     * Returns the Info event subtype based on the 'authenticationState'
     * @param authenticationState
     * @private
     */
    private getOtpAnalyticsSubtype(authenticationState: FastlaneAuthenticatedCustomerResult['authenticationState']) {
        switch (authenticationState) {
            case 'succeeded':
                return InfoEventType.OtpSucceeded;
            case 'canceled':
                return InfoEventType.OtpCanceled;
            case 'failed':
                return InfoEventType.OtpFailed;
            case 'not_found':
                return InfoEventType.LookupUserNotFound;
            default:
                return InfoEventType.OtpFailed;
        }
    }
}

export default FastlaneSDK;
