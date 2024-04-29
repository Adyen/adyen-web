import { getMastercardSettings, MC_SDK_PROD, MC_SDK_TEST } from './config';
import AbstractSrcInitiator from './AbstractSrcInitiator';
import SrciError, { MastercardError, VisaError } from './SrciError';
import {
    CustomSdkConfiguration,
    SrciCompleteIdentityValidationResponse,
    SrcIdentityLookupParams,
    SrciIdentityLookupResponse,
    SrcInitParams
} from './types';

const IdentityTypeMap = {
    email: 'EMAIL_ADDRESS',
    telephoneNumber: 'MOBILE_PHONE_NUMBER'
};

class MastercardSdk extends AbstractSrcInitiator {
    public readonly schemeName = 'mc';

    constructor(environment: string, customSdkConfig: CustomSdkConfiguration) {
        super(environment.toLowerCase().includes('live') ? MC_SDK_PROD : MC_SDK_TEST, customSdkConfig);
    }

    protected isSdkIsAvailableOnWindow(): boolean {
        // @ts-ignore SRCSDK_MASTERCARD is created by the MC sdk
        if (window.SRCSDK_MASTERCARD) return true;
        return false;
    }

    protected assignSdkReference(): void {
        // @ts-ignore SRCSDK_MASTERCARD is created by the MC sdk
        this.schemeSdk = window.SRCSDK_MASTERCARD;
    }

    public async init(params: SrcInitParams, srciTransactionId: string): Promise<void> {
        try {
            const sdkProps = {
                ...params,
                ...getMastercardSettings(this.customSdkConfiguration),
                srciTransactionId
            };
            await this.schemeSdk.init(sdkProps);
        } catch (err) {
            const srciError = new SrciError(err as VisaError | MastercardError, 'init', this.schemeName);
            throw srciError;
        }
    }

    public async identityLookup({ identityValue, type }: SrcIdentityLookupParams): Promise<SrciIdentityLookupResponse> {
        try {
            const consumerIdentity = {
                identityValue,
                identityType: IdentityTypeMap[type]
            };

            const response = await this.schemeSdk.identityLookup({ consumerIdentity });
            return response;
        } catch (err) {
            const srciError = new SrciError(err as VisaError | MastercardError, 'identityLookup', this.schemeName);
            throw srciError;
        }
    }

    public async completeIdentityValidation(otp: string): Promise<SrciCompleteIdentityValidationResponse> {
        try {
            const response = await this.schemeSdk.completeIdentityValidation({ validationData: otp });
            return response;
        } catch (err) {
            const srciError = new SrciError(err as VisaError | MastercardError, 'completeIdentityValidation', this.schemeName);
            throw srciError;
        }
    }
}

export default MastercardSdk;
