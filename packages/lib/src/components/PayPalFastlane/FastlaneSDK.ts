import { resolveEnvironments } from '../../core/Environment';
import requestFastlaneToken from './services/request-fastlane-token';
import { convertAdyenLocaleToFastlaneLocale } from './utils/convert-locale';
import Script from '../../utils/Script';
import AdyenCheckoutError from '../../core/Errors/AdyenCheckoutError';
import {
    ComponentConfiguration,
    Fastlane,
    FastlaneAuthenticatedCustomerResult,
    FastlaneShippingAddressSelectorResult,
    FastlaneSDKConfiguration
} from './types';
import type { FastlaneTokenData } from './services/request-fastlane-token';

class FastlaneSDK {
    private readonly clientKey: string;
    private readonly checkoutShopperURL: string;
    private readonly locale: string;

    private fastlaneSdk: Fastlane;
    private authenticatedShopper: { email: string; customerId: string };

    constructor(configuration: FastlaneSDKConfiguration) {
        if (!configuration.environment) throw new AdyenCheckoutError('IMPLEMENTATION_ERROR', "FastlaneSDK: 'environment' property is required");
        if (!configuration.clientKey) throw new AdyenCheckoutError('IMPLEMENTATION_ERROR', "FastlaneSDK: 'clientKey' property is required");

        const { apiUrl } = resolveEnvironments(configuration.environment);

        this.checkoutShopperURL = apiUrl;
        this.clientKey = configuration.clientKey;
        this.locale = convertAdyenLocaleToFastlaneLocale(configuration.locale || 'en-US');
    }

    public async initialize(): Promise<FastlaneSDK> {
        const tokenData = await this.requestClientToken();
        await this.fetchSdk(tokenData.value, tokenData.clientId);
        await this.initializeFastlane();
        return this;
    }

    public async authenticate(email: string): Promise<FastlaneAuthenticatedCustomerResult> {
        if (!this.fastlaneSdk) {
            throw new AdyenCheckoutError('IMPLEMENTATION_ERROR', 'FastlaneSDK is not initialized');
        }

        const { customerContextId } = await this.fastlaneSdk.identity.lookupCustomerByEmail(email);

        if (customerContextId) {
            this.authenticatedShopper = { email, customerId: customerContextId };
            return this.fastlaneSdk.identity.triggerAuthenticationFlow(customerContextId);
        } else {
            return {
                authenticationState: 'not_found',
                profileData: undefined
            };
        }
    }

    /**
     * TODO: Waiting for PayPal to provide the specific methods to fetch sessionId and Consent UI details
     */
    public getComponentConfiguration(authResult: FastlaneAuthenticatedCustomerResult): ComponentConfiguration {
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
                    fastlaneSessionId: 'xxxx-yyyy',
                    customerId: this.authenticatedShopper.customerId,
                    email: this.authenticatedShopper.email,
                    tokenId: authResult.profileData.card.id,
                    lastFour: authResult.profileData.card.paymentSource.card.lastDigits,
                    brand: authResult.profileData.card.paymentSource.card.brand
                }
            };
        } else {
            return {
                paymentType: 'card',
                configuration: {
                    fastlaneConfiguration: {
                        showConsent: true,
                        defaultToggleState: true,
                        termsAndConditionsLink: 'https://...',
                        privacyPolicyLink: 'https://...',
                        termsAndConditionsVersion: 'v1'
                    }
                }
            };
        }
    }

    public showShippingAddressSelector(): Promise<FastlaneShippingAddressSelectorResult> {
        if (!this.fastlaneSdk) {
            throw new AdyenCheckoutError('IMPLEMENTATION_ERROR', 'FastlaneSDK is not initialized');
        }
        return this.fastlaneSdk.profile.showShippingAddressSelector();
    }

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
            console.error(error);
        }
    }

    private async initializeFastlane(): Promise<void> {
        this.fastlaneSdk = await window.paypal.Fastlane({});
        this.fastlaneSdk.setLocale(this.locale);
    }
}

export default FastlaneSDK;
