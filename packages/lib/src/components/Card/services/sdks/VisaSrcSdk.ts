import { VISA_SDK_PROD, VISA_SDK_TEST } from '../config';
import { CompleteIdentityValidationResponse, IdentityLookupParams, IdentityLookupResponse, IsRecognizedResponse } from '../types';
import AbstractSrcInitiator from './AbstractSrcInitiator';
import SrciError from './SrciError';

const IdentityTypeMap = {
    email: 'EMAIL'
};

class VisaSrcSdk extends AbstractSrcInitiator {
    public readonly schemaName = 'visa';

    constructor(environment: string) {
        super(environment.toLowerCase() === 'test' ? VISA_SDK_TEST : VISA_SDK_PROD);
    }

    protected isSdkIsAvailableOnWindow(): boolean {
        // @ts-ignore vAdapters is created by the VISA sdk
        if (window.vAdapters?.VisaSRCI) return true;
        return false;
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

    public async completeIdentityValidation(otp: string): Promise<CompleteIdentityValidationResponse> {
        try {
            const response = await this.schemaSdk.completeIdentityValidation(otp);
            return response;
        } catch (err) {
            console.error(`[${this.schemaName}] # ${this.completeIdentityValidation.name}`, err);
            throw new SrciError(err?.error?.message, err?.error?.reason);
        }
    }
}

export default VisaSrcSdk;
