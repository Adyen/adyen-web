import { resolveEnvironments } from '../../core/Environment';
import requestFastlaneToken from './services/request-fastlane-token';
import { convertAdyenLocaleToFastlaneLocale } from './utils';
import Script from '../../utils/Script';

import type { Fastlane, FastlaneAuthenticatedCustomerResult, FastlaneShippingAddressSelectorResult } from './types';
import type { FastlaneTokenData } from './services/request-fastlane-token';
import type { CoreConfiguration } from '../../core/types';

export interface FastlaneSDKConfiguration {
    clientKey: string;
    locale?: 'en-US' | 'es-US' | 'fr-RS' | 'zh-US';
    environment?: CoreConfiguration['environment'];
}

class FastlaneSDK {
    private readonly clientKey: string;
    private readonly checkoutShopperURL: string;
    private readonly locale: string;

    private fastlaneSdk: Fastlane;

    constructor(configuration: FastlaneSDKConfiguration) {
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
        if (!this.fastlaneSdk.profile) return null;
        return this.fastlaneSdk.profile.showShippingAddressSelector();
    }

    public async mountWatermark(container: HTMLElement | string, options = { includeAdditionalInfo: false }): Promise<void> {
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
