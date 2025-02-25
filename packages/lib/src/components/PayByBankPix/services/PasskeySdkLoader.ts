import { IAdyenPasskey } from './types';
import { getUrlFromMap } from '../../../core/Environment/Environment';
import type { CoreConfiguration } from '../../../core/types';
import { CDN_ENVIRONMENTS } from '../../../core/Environment/constants';
import AdyenCheckoutError from '../../../core/Errors/AdyenCheckoutError';

export interface IPasskeySdkLoader {
    load(environment: CoreConfiguration['environment']): Promise<IAdyenPasskey>;
}

class PasskeySdkLoader implements IPasskeySdkLoader {
    private static PASSKEY_SDK_URL = `/adyen-passkey.js`; //todo: get the correct url
    private AdyenPasskey: null;

    private isAvailable(): boolean {
        return this.AdyenPasskey != null;
    }

    public async load(environment: string): Promise<IAdyenPasskey> {
        if (this.isAvailable()) return;
        try {
            // todo: remove this
            // eslint-disable-next-line no-constant-binary-expression
            const cdnScriptUrl = 'https://localhost:3020' ?? getUrlFromMap(environment as CoreConfiguration['environment'], CDN_ENVIRONMENTS);
            const url = `${cdnScriptUrl}${PasskeySdkLoader.PASSKEY_SDK_URL}`;
            const { AdyenPasskey } = await import(/* @vite-ignore */ url); // Vite does not support this dynamic import formats
            this.AdyenPasskey = AdyenPasskey;
            return this.AdyenPasskey;
        } catch (e: unknown) {
            throw new AdyenCheckoutError(
                'SCRIPT_ERROR',
                `Unable to load script. Message: ${e instanceof Error ? e.message : 'Unknown error loading passkey script'}`
            );
        }
    }
}

export { PasskeySdkLoader };
