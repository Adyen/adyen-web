import { getVisaSetttings, VISA_SDK_PROD, VISA_SDK_TEST } from './config';
import { IdentityLookupParams } from '../types';
import AbstractSrcInitiator from './AbstractSrcInitiator';
import SrciError from './SrciError';
import { CustomSdkConfiguration, SrciCompleteIdentityValidationResponse, SrciIdentityLookupResponse, SrcInitParams } from './types';

const IdentityTypeMap = {
    email: 'EMAIL',
    mobilePhone: 'MOBILE_NUMBER'
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

    public async identityLookup(params: IdentityLookupParams): Promise<SrciIdentityLookupResponse> {
        try {
            const consumerIdentity = {
                identityValue: params.value,
                type: IdentityTypeMap[params.type]
            };

            const response = await this.schemeSdk.identityLookup(consumerIdentity);
            return response;
        } catch (err) {
            throw new SrciError(err, 'identityLookup');
        }
    }

    public async completeIdentityValidation(otp: string): Promise<SrciCompleteIdentityValidationResponse> {
        try {
            const response = await this.schemeSdk.completeIdentityValidation(otp);
            return response;
        } catch (err) {
            throw new SrciError(err, 'completeIdentityValidation');
        }
    }
}

export default VisaSdk;
