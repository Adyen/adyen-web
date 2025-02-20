import { IPasskeyWindowObject } from './types';
import Script from '../../../utils/Script';
import { getUrlFromMap } from '../../../core/Environment/Environment';
import type { CoreConfiguration } from '../../../core/types';
import { CDN_ENVIRONMENTS } from '../../../core/Environment/constants';

export interface IPasskeySdkLoader {
    load(environment: CoreConfiguration['environment']): Promise<IPasskeyWindowObject>;
}

class PasskeySdkLoader implements IPasskeySdkLoader {
    private static PASSKEY_SDK_URL = '';

    private isAvailable(): boolean {
        return globalThis.AdyenPasskey != null;
    }

    public async load(environment: string): Promise<IPasskeyWindowObject> {
        if (this.isAvailable()) return;

        const cdnScriptUrl = getUrlFromMap(environment as CoreConfiguration['environment'], CDN_ENVIRONMENTS);
        const scriptElement = new Script(`${cdnScriptUrl}${PasskeySdkLoader.PASSKEY_SDK_URL}`); //todo: get the correct url
        await scriptElement.load();
        return globalThis.AdyenPasskey;
    }
}

export { PasskeySdkLoader };
