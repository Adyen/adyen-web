import { VISA_SDK_PROD, VISA_SDK_TEST } from '../config';
import { IdentityLookupParams } from '../types';
import AbstractSrcInitiator from './AbstractSrcInitiator';
import SrciError from './SrciError';
import { SrciCompleteIdentityValidationResponse, SrciIdentityLookupResponse } from './types';

const IdentityTypeMap = {
    email: 'EMAIL'
};

class VisaSdk extends AbstractSrcInitiator {
    public readonly schemeName = 'visa';

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
        this.schemeSdk = new window.vAdapters.VisaSRCI();
    }

    public async identityLookup(params: IdentityLookupParams): Promise<SrciIdentityLookupResponse> {
        try {
            const consumerIdentity = {
                identityValue: params.value,
                type: IdentityTypeMap[params.type]
            };

            const response = await this.schemeSdk.identityLookup(consumerIdentity);
            return response;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    public async completeIdentityValidation(otp: string): Promise<SrciCompleteIdentityValidationResponse> {
        try {
            const response = await this.schemeSdk.completeIdentityValidation(otp);
            return response;
        } catch (err) {
            console.error(`[${this.schemeName}] # ${this.completeIdentityValidation.name}`, err);
            throw new SrciError(err?.error?.message, err?.error?.reason);
        }
    }
}

export default VisaSdk;
