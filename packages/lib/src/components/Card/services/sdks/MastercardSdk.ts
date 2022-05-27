import { MC_SDK_PROD, MC_SDK_TEST } from '../config';
import { IdentityLookupParams } from '../types';
import AbstractSrcInitiator from './AbstractSrcInitiator';
import SrciError from './SrciError';
import { SrciCompleteIdentityValidationResponse, SrciIdentityLookupResponse } from './types';

const IdentityTypeMap = {
    email: 'EMAIL_ADDRESS'
};

class MasterCardSdk extends AbstractSrcInitiator {
    public readonly schemaName = 'mastercard';

    constructor(environment: string) {
        super(environment.toLowerCase() === 'test' ? MC_SDK_TEST : MC_SDK_PROD);
    }

    protected isSdkIsAvailableOnWindow(): boolean {
        // @ts-ignore SRCSDK_MASTERCARD is created by the MC sdk
        if (window.SRCSDK_MASTERCARD) return true;
        return false;
    }

    protected assignSdkReference(): void {
        // @ts-ignore SRCSDK_MASTERCARD is created by the MC sdk
        this.schemaSdk = window.SRCSDK_MASTERCARD;
    }

    public async identityLookup(params: IdentityLookupParams): Promise<SrciIdentityLookupResponse> {
        try {
            const consumerIdentity = {
                identityValue: params.value,
                identityType: IdentityTypeMap[params.type]
            };

            const response = await this.schemaSdk.identityLookup({ consumerIdentity });
            return response;
        } catch (error) {
            // console.error(error);
            console.log(JSON.stringify(error, null, 2));
            throw error;
        }
    }

    public async completeIdentityValidation(otp: string): Promise<SrciCompleteIdentityValidationResponse> {
        try {
            const response = await this.schemaSdk.completeIdentityValidation({ validationData: otp });
            return response;
        } catch (err) {
            throw new SrciError(err?.message, err?.reason);
        }
    }
}

export default MasterCardSdk;
