import { IdentityLookupParams } from '../types';
import Script from '../../../../../../utils/Script';
import {
    CustomSdkConfiguration,
    SrcCheckoutParams,
    SrciCheckoutResponse,
    SrciCompleteIdentityValidationResponse,
    SrciIdentityLookupResponse,
    SrciInitiateIdentityValidationResponse,
    SrciIsRecognizedResponse,
    SrcInitParams,
    SrcProfile
} from './types';
import { ClickToPayScheme } from '../../../../types';
import SrciError from './SrciError';

export interface ISrcInitiator {
    schemeName: ClickToPayScheme;
    // Loading 3rd party library
    loadSdkScript(): Promise<void>;
    removeSdkScript(): void;
    // SRCi specification methods
    init(params: SrcInitParams, srciTransactionId: string): Promise<void>;
    isRecognized(): Promise<SrciIsRecognizedResponse>;
    identityLookup(params: IdentityLookupParams): Promise<SrciIdentityLookupResponse>;
    initiateIdentityValidation(): Promise<SrciInitiateIdentityValidationResponse>;
    completeIdentityValidation(validationData: string): Promise<SrciCompleteIdentityValidationResponse>;
    getSrcProfile(idTokens: string[]): Promise<SrcProfile>;
    checkout(params: SrcCheckoutParams): Promise<SrciCheckoutResponse>;
    unbindAppInstance(): Promise<void>;
}

export default abstract class AbstractSrcInitiator implements ISrcInitiator {
    public schemeSdk: any;
    public abstract readonly schemeName: ClickToPayScheme;

    protected readonly customSdkConfiguration: CustomSdkConfiguration;

    private readonly sdkUrl: string;
    private scriptElement: Script | null = null;

    protected constructor(sdkUrl: string, customSdkConfiguration: CustomSdkConfiguration) {
        if (!sdkUrl) throw Error('AbstractSrcInitiator: Invalid SDK URL');

        this.sdkUrl = sdkUrl;
        this.customSdkConfiguration = customSdkConfiguration;
    }

    public async loadSdkScript() {
        if (!this.isSdkIsAvailableOnWindow()) {
            this.scriptElement = new Script(this.sdkUrl);
            await this.scriptElement.load();
        }
        this.assignSdkReference();
    }

    public removeSdkScript(): void {
        this.scriptElement.remove();
    }

    /**
     * Verifies if SDK is already loaded on the window object.
     * Example: Merchant can preload the SDK to speed up the loading time
     */
    protected abstract isSdkIsAvailableOnWindow(): boolean;

    /**
     * Assign SchemeSDK object to 'schemeSdk' property.
     * Each scheme creates its own object reference on 'window' using different naming,
     * therefore this method should be implemented by the subclass to assign the property
     * accordingly
     */
    protected abstract assignSdkReference(): void;

    /**
     * Initializes the app with common state. The init method must be called before any other methods.
     */
    public abstract init(params: SrcInitParams, srciTransactionId: string): Promise<void>;

    /**
     * This method performs checkout using the specified card. If successful, the
     * response contains summary checkout information.
     */
    public async checkout(params: SrcCheckoutParams): Promise<SrciCheckoutResponse> {
        try {
            const checkoutResponse = await this.schemeSdk.checkout(params);
            return checkoutResponse;
        } catch (error) {
            const srciError = new SrciError(error, 'checkout', this.schemeName);
            throw srciError;
        }
    }

    /**
     * This method disassociates the Consumer application / Consumer Device from the Consumer’s SRC Profile.
     */
    public async unbindAppInstance(): Promise<void> {
        return await this.schemeSdk.unbindAppInstance();
    }

    /**
     * Determines whether the consumer is recognized, e.g. by detecting the presence of a local cookie in
     * the browser environment.
     */
    public async isRecognized(): Promise<SrciIsRecognizedResponse> {
        try {
            const isRecognizedResponse = await this.schemeSdk.isRecognized();
            return isRecognizedResponse;
        } catch (error) {
            const srciError = new SrciError(error, 'isRecognized', this.schemeName);
            throw srciError;
        }
    }

    /**
     * Sends a validation code to the specified consumer.
     * This method sends a one-time password (OTP) to the consumer to start validation
     */
    public async initiateIdentityValidation(): Promise<SrciInitiateIdentityValidationResponse> {
        try {
            const identityValidationResponse = await this.schemeSdk.initiateIdentityValidation();
            return identityValidationResponse;
        } catch (error) {
            const srciError = new SrciError(error, 'initiateIdentityValidation', this.schemeName);
            throw srciError;
        }
    }

    /**
     * Obtains the masked card and other account profile data associated with the userId.
     */
    public async getSrcProfile(idTokens: string[]): Promise<SrcProfile> {
        try {
            const getSrcProfileResponse = await this.schemeSdk.getSrcProfile({ idTokens });
            return getSrcProfileResponse;
        } catch (error) {
            const srciError = new SrciError(error, 'getSrcProfile', this.schemeName);
            throw srciError;
        }
    }

    /**
     * Obtains the user account associated with the consumer’s identity (an email address or phone
     * number).
     */
    public abstract identityLookup(params: IdentityLookupParams): Promise<SrciIdentityLookupResponse>;

    /**
     * This method completes the identity validation by receiving the one-time password (OTP) sent to the
     * consumer to start validation.
     */
    public abstract completeIdentityValidation(otp: string): Promise<SrciCompleteIdentityValidationResponse>;
}
