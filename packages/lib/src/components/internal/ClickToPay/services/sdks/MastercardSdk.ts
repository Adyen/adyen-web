import { getMastercardSettings, MC_SDK_PROD, MC_SDK_TEST } from './config';
import AbstractSrcInitiator from './AbstractSrcInitiator';
import SrciError from './SrciError';
import {
    CustomSdkConfiguration,
    SrciCompleteIdentityValidationResponse,
    SrcIdentityLookupParams,
    SrciIdentityLookupResponse,
    SrciIsRecognizedResponse,
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

    public async isRecognized(): Promise<SrciIsRecognizedResponse> {
        try {
            const isRecognizedResponse = await this.schemeSdk.isRecognized();
            return isRecognizedResponse;
        } catch (error) {
            const srciError = new SrciError(error, 'isRecognized', this.schemeName);
            throw srciError;
        }
    }

    public async init(params: SrcInitParams, srciTransactionId: string): Promise<void> {
        const sdkProps = {
            ...params,
            ...getMastercardSettings(this.customSdkConfiguration),
            srciTransactionId
        };
        await this.schemeSdk.init(sdkProps);
    }

    public async identityLookup({ identityValue, type }: SrcIdentityLookupParams): Promise<SrciIdentityLookupResponse> {
        try {
            console.time(`identityLookup ${this.schemeName}`);
            const consumerIdentity = {
                identityValue,
                identityType: IdentityTypeMap[type]
            };

            const response = await this.schemeSdk.identityLookup({ consumerIdentity });
            console.timeEnd(`identityLookup ${this.schemeName}`);
            return response;
        } catch (err) {
            const srciError = new SrciError(err, 'identityLookup', this.schemeName);
            throw srciError;
        }
    }

    public async completeIdentityValidation(otp: string): Promise<SrciCompleteIdentityValidationResponse> {
        try {
            const response = await this.schemeSdk.completeIdentityValidation({ validationData: otp });
            return response;
        } catch (err) {
            const srciError = new SrciError(err, 'completeIdentityValidation', this.schemeName);
            throw srciError;
        }
    }
}

export default MastercardSdk;
