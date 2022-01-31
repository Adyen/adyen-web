import Script from '../../../utils/Script';
import SecureRemoteCommerceInitiator, { IdentityLookupParams, IdentityLookupResponse } from './SecureRemoteCommerceService';

export interface ISecureRemoteCommerceSdk extends SecureRemoteCommerceInitiator {
    load(): Promise<void>;
    remove(): void;
}

const IdentityTypeMap = {
    email: 'EMAIL'
};

class VisaSrcSdk extends SecureRemoteCommerceInitiator implements ISecureRemoteCommerceSdk {
    public static TEST_URL = 'https://sandbox-assets.secure.checkout.visa.com/checkout-widget/resources/js/src-i-adapter/visaSdk.js';
    public static PROD_URL = 'https://assets.secure.checkout.visa.com/checkout-widget/resources/js/src-i-adapter/visaSdk.js';

    public script: Script;

    public async load() {
        this.script = new Script(VisaSrcSdk.TEST_URL);
        await this.script.load();
        // @ts-ignore vAdapters is created by the loaded sdk
        this.schemaSdk = new window.vAdapters.VisaSRCI();
    }

    public remove() {
        this.script.remove();
    }

    public async identityLookup(params: IdentityLookupParams): Promise<IdentityLookupResponse> {
        try {
            const consumerIdentity = {
                identityValue: params.value,
                type: IdentityTypeMap[params.type]
            };

            const response = await this.schemaSdk.identityLookup(consumerIdentity);
            return response;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}

export default VisaSrcSdk;
