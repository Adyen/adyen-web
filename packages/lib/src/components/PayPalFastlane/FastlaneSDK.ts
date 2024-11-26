import { resolveEnvironments } from '../../core/Environment';
import requestFastlaneToken from './services/request-fastlane-token';
import { convertAdyenLocaleToFastlaneLocale } from './utils/convert-locale';
import Script from '../../utils/Script';

import type { Fastlane, FastlaneAuthenticatedCustomerResult, FastlaneShippingAddressSelectorResult } from './types';
import type { FastlaneTokenData } from './services/request-fastlane-token';
import type { CoreConfiguration } from '../../core/types';
import AdyenCheckoutError from '../../core/Errors/AdyenCheckoutError';

export interface FastlaneSDKConfiguration {
    clientKey: string;
    environment: CoreConfiguration['environment'];
    locale?: 'en-US' | 'es-US' | 'fr-RS' | 'zh-US';
}

class FastlaneSDK {
    private readonly clientKey: string;
    private readonly checkoutShopperURL: string;
    private readonly locale: string;

    private fastlaneSdk: Fastlane;

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
            return this.fastlaneSdk.identity.triggerAuthenticationFlow(customerContextId);
        } else {
            return {
                authenticationState: 'not_found',
                profileData: undefined
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
