import {
    CustomSdkConfiguration,
    SrcCheckoutParams,
    SrciCheckoutResponse,
    SrciCompleteIdentityValidationResponse,
    SrcIdentityLookupParams,
    SrciIdentityLookupResponse,
    SrciInitiateIdentityValidationResponse,
    SrciIsRecognizedResponse,
    SrcInitParams,
    SrcProfile
} from './types';
import SrciError, { MastercardError, VisaError } from './SrciError';
import { ClickToPayScheme } from '../../types';
import Script from '../../../../../utils/Script';
import { AnalyticsModule } from '../../../../../types/global-types';

export interface ISrcInitiator {
    schemeName: ClickToPayScheme;
    // Loading 3rd party library
    loadSdkScript(): Promise<void>;
    removeSdkScript(): void;
    // SRCi specification methods
    init(params: SrcInitParams, srciTransactionId: string): Promise<void>;
    isRecognized(): Promise<SrciIsRecognizedResponse>;
    identityLookup(params: SrcIdentityLookupParams): Promise<SrciIdentityLookupResponse>;
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

    private readonly analytics: AnalyticsModule;
    private readonly sdkUrl: string;
    private scriptElement: Script | null = null;

    protected constructor(sdkUrl: string, customSdkConfiguration: CustomSdkConfiguration, analytics: AnalyticsModule) {
        if (!sdkUrl) throw Error('AbstractSrcInitiator: Invalid SDK URL');

        this.sdkUrl = sdkUrl;
        this.customSdkConfiguration = customSdkConfiguration;
        this.analytics = analytics;
    }

    public async loadSdkScript(): Promise<void> {
        if (!this.isSdkIsAvailableOnWindow()) {
            this.scriptElement = new Script({
                src: this.sdkUrl,
                component: 'clicktopay',
                analytics: this.analytics
            });

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
            const srciError = new SrciError(error as VisaError | MastercardError, 'checkout', this.schemeName);
            throw srciError;
        }
    }

    /**
     * This method disassociates the Consumer application / Consumer Device from the Consumer’s SRC Profile.
     */
    public async unbindAppInstance(): Promise<void> {
        try {
            await this.schemeSdk.unbindAppInstance();
        } catch (error) {
            const srciError = new SrciError(error as VisaError | MastercardError, 'unbindAppInstance', this.schemeName);
            throw srciError;
        }
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
            const srciError = new SrciError(error as VisaError | MastercardError, 'isRecognized', this.schemeName);
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
            const srciError = new SrciError(error as VisaError | MastercardError, 'initiateIdentityValidation', this.schemeName);
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
            const srciError = new SrciError(error as VisaError | MastercardError, 'getSrcProfile', this.schemeName);
            throw srciError;
        }
    }

    /**
     * Obtains the user account associated with the consumer’s identity (an email address or phone
     * number).
     */
    public abstract identityLookup(params: SrcIdentityLookupParams): Promise<SrciIdentityLookupResponse>;

    /**
     * This method completes the identity validation by receiving the one-time password (OTP) sent to the
     * consumer to start validation.
     */
    public abstract completeIdentityValidation(otp: string): Promise<SrciCompleteIdentityValidationResponse>;
}
