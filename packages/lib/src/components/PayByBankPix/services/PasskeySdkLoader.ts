import { IPasskeyWindowObject } from './types';
import Script from '../../../utils/Script';

export interface IPasskeySdkLoader {
    load(environment: string): Promise<IPasskeyWindowObject>;
}

class PasskeySdkLoader implements IPasskeySdkLoader {
    private static PASSKEY_SDK_URL = 'https://cdnjs.cloudflare.com/ajax/libs/mathjs/14.0.1/math.js';
    private module: Promise<IPasskeyWindowObject>;

    private isAvailable(): boolean {
        return globalThis.math != null;
    }

    public async load(environment: string): Promise<IPasskeyWindowObject> {
        if (this.isAvailable()) return;

        try {
            const scriptElement = new Script(PasskeySdkLoader.PASSKEY_SDK_URL);
            await scriptElement.load();
            return globalThis.math; //todo: change this to passkey namespace
        } catch (error) {
            console.error('Failed to load the SDK:', error);
        }
    }
}

export { PasskeySdkLoader };
