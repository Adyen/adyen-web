import Script from '../../../utils/Script';
import SecureRemoteCommerceInitiator, { IdentityLookupParams, IdentityLookupResponse } from './SecureRemoteCommerceService';

const IdentityTypeMap = {
    email: 'EMAIL_ADDRESS'
};

class MasterCardSdk extends SecureRemoteCommerceInitiator {
    public static TEST_URL = 'https://sandbox-assets.secure.checkout.visa.com/checkout-widget/resources/js/src-i-adapter/visaSdk.js';
    public static PROD_URL = 'https://assets.secure.checkout.visa.com/checkout-widget/resources/js/src-i-adapter/visaSdk.js';

    public script: Script;

    public async load() {
        this.script = new Script(MasterCardSdk.TEST_URL);
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
                identityType: IdentityTypeMap[params.type]
            };

            const response = await this.schemaSdk.identityLookup({ consumerIdentity });
            return response;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}

export default MasterCardSdk;
