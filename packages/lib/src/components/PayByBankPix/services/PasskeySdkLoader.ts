import { IAdyenPasskey } from './types';
import { getUrlFromMap } from '../../../core/Environment/Environment';
import type { CoreConfiguration } from '../../../core/types';
import { CDN_ENVIRONMENTS } from '../../../core/Environment/constants';
import AdyenCheckoutError from '../../../core/Errors/AdyenCheckoutError';

export interface IPasskeySdkLoader {
    load(environment: CoreConfiguration['environment']): Promise<IAdyenPasskey>;
}

class PasskeySdkLoader implements IPasskeySdkLoader {
    private static PASSKEY_SDK_URL = 'js/adyenpasskey/1.0.0/adyen-passkey.js';
    private AdyenPasskey: null;

    private isAvailable(): boolean {
        return this.AdyenPasskey != null;
    }

    public async load(environment: string): Promise<IAdyenPasskey> {
        if (this.isAvailable()) return;
        try {
            const cdnUrl = getUrlFromMap(environment as CoreConfiguration['environment'], CDN_ENVIRONMENTS);
            const url = `${cdnUrl}${PasskeySdkLoader.PASSKEY_SDK_URL}`;
            const module = await import(/* @vite-ignore */ url); // Vite does not support this dynamic import formats
            this.AdyenPasskey = module.default.AdyenPasskey;
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
