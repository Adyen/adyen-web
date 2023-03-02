import { getVisaSetttings, VISA_SDK_PROD, VISA_SDK_TEST } from './config';
import AbstractSrcInitiator from './AbstractSrcInitiator';
import SrciError from './SrciError';
import {
    CustomSdkConfiguration,
    SrciCompleteIdentityValidationResponse,
    SrcIdentityLookupParams,
    SrciIdentityLookupResponse,
    SrcInitParams
} from './types';

const IdentityTypeMap = {
    email: 'EMAIL',
    telephoneNumber: 'MOBILE_NUMBER'
};

class VisaSdk extends AbstractSrcInitiator {
    public readonly schemeName = 'visa';

    constructor(environment: string, customSdkConfig: CustomSdkConfiguration) {
        super(environment.toLowerCase().includes('live') ? VISA_SDK_PROD : VISA_SDK_TEST, customSdkConfig);
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

    public async init(params: SrcInitParams, srciTransactionId: string): Promise<void> {
        const sdkProps = {
            ...params,
            ...getVisaSetttings(this.customSdkConfiguration),
            srciTransactionId
        };

        await this.schemeSdk.init(sdkProps);
    }

    public async identityLookup({ identityValue, type }: SrcIdentityLookupParams): Promise<SrciIdentityLookupResponse> {
        try {
            const consumerIdentity = {
                identityValue,
                type: IdentityTypeMap[type]
            };

            const response = await this.schemeSdk.identityLookup(consumerIdentity);
            return response;
        } catch (err) {
            const srciError = new SrciError(err, 'identityLookup', this.schemeName);
            throw srciError;
        }
    }

    public async completeIdentityValidation(otp: string): Promise<SrciCompleteIdentityValidationResponse> {
        try {
            const response = await this.schemeSdk.completeIdentityValidation(otp);
            return response;
        } catch (err) {
            const srciError = new SrciError(err, 'completeIdentityValidation', this.schemeName);
            throw srciError;
        }
    }
}

export default VisaSdk;
