import { IAdyenPasskey } from './types';
import { getUrlFromMap } from '../../../core/Environment/Environment';
import type { CoreConfiguration } from '../../../core/types';
import { CDN_ENVIRONMENTS } from '../../../core/Environment/constants';
import AdyenCheckoutError from '../../../core/Errors/AdyenCheckoutError';
import Script from '../../../utils/Script';
import { IAnalytics } from '../../../core/Analytics/Analytics';

export interface IPasskeySdkLoader {
    load(environment: CoreConfiguration['environment'], analytics: IAnalytics): Promise<IAdyenPasskey>;
}

class PasskeySdkLoader implements IPasskeySdkLoader {
    private static readonly PASSKEY_SDK_URL = 'js/adyenpasskey/1.1.0/adyen-passkey.js';
    private AdyenPasskey: IAdyenPasskey;

    private readonly analytics: IAnalytics;
    private readonly environment: string;

    constructor({ analytics, environment }: { analytics: IAnalytics; environment: string }) {
        this.analytics = analytics;
        this.environment = environment;
    }

    private isAvailable(): boolean {
        return this.AdyenPasskey != null;
    }

    public async load(): Promise<IAdyenPasskey> {
        if (this.isAvailable()) {
            return this.AdyenPasskey;
        }

        try {
            const cdnUrl = getUrlFromMap(this.environment as CoreConfiguration['environment'], CDN_ENVIRONMENTS);
            const url = `${cdnUrl}${PasskeySdkLoader.PASSKEY_SDK_URL}`;

            const scriptElement = new Script({
                src: url,
                component: 'paybybank_pix',
                analytics: this.analytics
            });

            await scriptElement.load();
            this.AdyenPasskey = window.AdyenPasskey?.default;
            return this.AdyenPasskey;
        } catch (e: unknown) {
            throw new AdyenCheckoutError(
                'SCRIPT_ERROR',
                `Unable to load script. Message: ${e instanceof Error ? e.message : 'Unknown error loading Passkey sdk'}`
            );
        }
    }
}

export { PasskeySdkLoader };
