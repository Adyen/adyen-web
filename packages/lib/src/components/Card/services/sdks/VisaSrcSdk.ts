import Script from '../../../../utils/Script';
import { VISA_SDK_PROD, VISA_SDK_TEST } from '../config';
import { IdentityLookupParams, IdentityLookupResponse } from '../types';
import AbstractSrcInitiator from './AbstractSrcInitiator';

const IdentityTypeMap = {
    email: 'EMAIL'
};

class VisaSrcSdk extends AbstractSrcInitiator {
    public script: Script;

    constructor(environment: string) {
        super(environment.toLowerCase() === 'test' ? VISA_SDK_TEST : VISA_SDK_PROD);
    }

    protected assignSdkReference(): void {
        // @ts-ignore vAdapters is created by the VISA sdk
        this.schemaSdk = new window.vAdapters.VisaSRCI();
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
