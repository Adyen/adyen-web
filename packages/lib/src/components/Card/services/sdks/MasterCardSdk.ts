import { MC_SDK_PROD, MC_SDK_TEST } from '../config';
import { IdentityLookupParams, IdentityLookupResponse } from '../types';
import AbstractSrcInitiator from './AbstractSrcInitiator';

const IdentityTypeMap = {
    email: 'EMAIL_ADDRESS'
};

const SCHEMA = 'mc';

class MasterCardSdk extends AbstractSrcInitiator {
    constructor(environment: string) {
        super(SCHEMA, environment.toLowerCase() === 'test' ? MC_SDK_TEST : MC_SDK_PROD);
    }

    protected assignSdkReference(): void {
        // @ts-ignore vAdapters is created by the VISA sdk
        this.schemaSdk = window.SRCSDK_MASTERCARD;
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
