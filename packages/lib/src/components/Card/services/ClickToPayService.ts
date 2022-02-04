import { ISrcInitiator } from './sdks/AbstractSrcInitiator';
import { CheckoutResponse, InitiateIdentityValidationResponse, IsRecognizedResponse } from './types';
import { ISrcSdkLoader } from './sdks/SrcSdkLoader';
import { SecureRemoteCommerceInitResult } from './configMock';

export enum CtpState {
    Idle = 'Idle',
    Loading = 'Loading',
    NotAvailable = 'NotAvailable',
    AwaitingSignIn = 'AwaitingSignIn',
    OneTimePassword = 'OneTimePassword',
    Ready = 'Ready',
    Checkout = 'Checkout'
}

type CallbackStateSubscriber = (state: CtpState) => void;

type ShopperIdentity = {
    value: string;
    type: string;
};

interface IClickToPayService {
    maskedCards: any;

    initialize(): Promise<void>;
    checkout(srcDigitalCardId: string): Promise<CheckoutResponse>;

    subscribeOnStatusChange(callback: CallbackStateSubscriber): void;

    // identification flow
    startIdentityValidation(): Promise<InitiateIdentityValidationResponse>;
    abortIdentityValidation(): void;
    finishIdentityValidation(otpCode: string): Promise<any>;
}

class ClickToPayService implements IClickToPayService {
    private readonly sdkLoader: ISrcSdkLoader;
    private readonly schemasConfig: Record<string, SecureRemoteCommerceInitResult>;
    private readonly shopperIdentity?: ShopperIdentity;

    private state: CtpState = CtpState.Idle;
    private stateSubscriber: CallbackStateSubscriber;

    private sdks: ISrcInitiator[];
    private srcProfile: any;
    private srcCorrelationId: any;

    private validationSchemaSdk: ISrcInitiator = null;

    constructor(schemasConfig: Record<string, SecureRemoteCommerceInitResult>, sdkLoader: ISrcSdkLoader, shopperIdentity?: ShopperIdentity) {
        this.sdkLoader = sdkLoader;
        this.schemasConfig = schemasConfig;
        this.shopperIdentity = shopperIdentity;
    }

    public get maskedCards() {
        return this.srcProfile?.maskedCards;
    }

    public async initialize(): Promise<void> {
        this.setState(CtpState.Loading);

        try {
            this.sdks = await this.sdkLoader.load();
            await this.initiateSdks();

            const { recognized = false, idTokens = null } = await this.recognizeShopper();

            if (recognized) {
                await this.getSecureRemoteCommerceProfile(idTokens);
                this.setState(CtpState.Ready);
                return;
            }

            if (!this.shopperIdentity) {
                this.setState(CtpState.NotAvailable);
                return;
            }

            const isEnrolled = await this.identifyShopper();

            if (isEnrolled) this.setState(CtpState.AwaitingSignIn);
            else this.setState(CtpState.NotAvailable);
        } catch (error) {
            console.error(error);
            this.setState(CtpState.NotAvailable);
        }
    }

    public subscribeOnStatusChange(callback): void {
        this.stateSubscriber = callback;
    }

    /**
     * Initiates Consumer Identity validation with one Click to Pay System.
     * The Click to Pay System sends a one-time-password (OTP) to the registered email address or mobile number.
     *
     * This method uses only the SDK that responded first on identifyShopper() call. There is no need to use all SDK's
     */
    public async startIdentityValidation(): Promise<InitiateIdentityValidationResponse> {
        if (!this.validationSchemaSdk) {
            throw Error('initiateIdentityValidation: No schema set for the validation process');
        }

        const maskedData = await this.validationSchemaSdk.initiateIdentityValidation();
        this.setState(CtpState.OneTimePassword);
        return maskedData;
    }

    public abortIdentityValidation() {
        this.setState(CtpState.AwaitingSignIn);
    }

    /**
     * Completes the validation of a Consumer Identity, by evaluating the supplied OTP.
     * This method uses only the SDK that responded first on identifyShopper() call. There is no need to use all SDK's
     */
    public async finishIdentityValidation(otpCode: string): Promise<any> {
        if (!this.validationSchemaSdk) {
            throw Error('finishIdentityValidation: No schema set for the validation process');
        }
        const validationToken = await this.validationSchemaSdk.completeIdentityValidation(otpCode);
        await this.getSecureRemoteCommerceProfile([validationToken.idToken]);
        this.validationSchemaSdk = null;
    }

    /**
     * This method performs checkout using the selected card
     */
    public async checkout(srcDigitalCardId: string): Promise<CheckoutResponse> {
        if (!srcDigitalCardId) {
            throw Error('checkout: No card ID provided');
        }

        const params = {
            srcDigitalCardId,
            srcCorrelationId: this.srcCorrelationId,
            idToken: this.srcProfile.idToken
        };

        // TODO: which SDK to pick up for the checkout? For now, picking up the first one
        const checkoutResponse = await this.sdks[0].checkout(params);
        return checkoutResponse;
    }

    private async getSecureRemoteCommerceProfile(idTokens: string[]): Promise<void> {
        const srcProfilesPromises = this.sdks.map(sdk => sdk.getSrcProfile(idTokens));
        const srcProfiles = await Promise.all(srcProfilesPromises);

        // TODO: verify when APi return multiple profiles. What to do with that?
        // For now it is taking only the first one of the first response
        this.srcProfile = srcProfiles[0]?.profiles[0];
        this.srcCorrelationId = srcProfiles[0]?.srcCorrelationId;

        console.log(this.srcProfile, this.srcCorrelationId);

        this.setState(CtpState.Ready);
    }

    private setState(state: CtpState): void {
        this.state = state;

        if (this.stateSubscriber) {
            this.stateSubscriber(this.state);
        }
    }

    /**
     * Checks if the consumer is recognized by any of the Click to Pay System
     * If recognized, it takes the first one in the response and uses its token
     */
    private async recognizeShopper(): Promise<IsRecognizedResponse> {
        const recognizingPromises = this.sdks.map(sdk => sdk.isRecognized());
        const recognizeResponses = await Promise.all(recognizingPromises);

        const isRecognizedResp = recognizeResponses.find(response => response.recognized);
        return isRecognizedResp || { recognized: false };
    }

    /**
     * Call the identityLookup() method of each SRC SDK.
     *
     * Based on the responses from the Click to Pay Systems, we should call the
     * initiateIdentityValidation() SDK method of the Click to Pay System that
     * responds first with consumerPresent response to the identityLookup() call
     */
    private async identifyShopper(): Promise<boolean> {
        const identifyLookupPromises = this.sdks.map(sdk =>
            sdk.identityLookup({ value: this.shopperIdentity.value, type: this.shopperIdentity.type })
        );
        const identifyLookupResponses = await Promise.all(identifyLookupPromises);

        // Find the index of the first schema that returns consumerPresent
        const schemaIndex = identifyLookupResponses.findIndex(response => response.consumerPresent);
        this.validationSchemaSdk = this.sdks[schemaIndex];

        return this.validationSchemaSdk !== null;
    }

    private async initiateSdks(): Promise<void> {
        const initPromises = this.sdks.map(sdk => {
            const cfg = this.schemasConfig[sdk.schemaName];
            return sdk.init(cfg);
        });
        await Promise.all(initPromises);
    }
}

export default ClickToPayService;
