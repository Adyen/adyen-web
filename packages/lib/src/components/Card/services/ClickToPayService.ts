import { ISrcInitiator } from './sdks/AbstractSrcInitiator';
import { CheckoutResponse, IsRecognizedResponse } from './types';
import { ISrcSdkLoader } from './sdks/SrcSdkLoader';
import { SecureRemoteCommerceInitResult } from './configMock';
import { createShopperCardsList } from './utils';

export enum CtpState {
    Idle = 'Idle',
    Loading = 'Loading',
    ShopperIdentified = 'ShopperIdentified',
    OneTimePassword = 'OneTimePassword',
    Ready = 'Ready',
    Login = 'Login',
    NotAvailable = 'NotAvailable'
    // Checkout = 'Checkout'
}

type CallbackStateSubscriber = (state: CtpState) => void;

type ShopperIdentity = {
    value: string;
    type: string;
};

export interface IClickToPayService {
    maskedCards: any;
    maskedShopperContact: any;
    state: CtpState;
    shopperCards: any;

    initialize(): Promise<void>;
    checkout(srcDigitalCardId: string): Promise<CheckoutResponse>;

    subscribeOnStatusChange(callback: CallbackStateSubscriber): void;

    // identification flow
    startIdentityValidation(): Promise<any>;
    // abortIdentityValidation(): void;
    finishIdentityValidation(otpCode: string): Promise<any>;
}

class ClickToPayService implements IClickToPayService {
    private readonly sdkLoader: ISrcSdkLoader;
    private readonly schemasConfig: Record<string, SecureRemoteCommerceInitResult>;
    private readonly shopperIdentity?: ShopperIdentity;

    public state: CtpState = CtpState.Idle;
    private stateSubscriber: CallbackStateSubscriber;

    private sdks: ISrcInitiator[];
    public shopperCards: any;

    // be removed maybe?
    private srcProfile: any;
    private shopperMaskedValidationData: any;
    private srcCorrelationId: any;

    private validationSchemaSdk: ISrcInitiator | null = null;

    constructor(schemasConfig: Record<string, SecureRemoteCommerceInitResult>, sdkLoader: ISrcSdkLoader, shopperIdentity?: ShopperIdentity) {
        this.sdkLoader = sdkLoader;
        this.schemasConfig = schemasConfig;
        this.shopperIdentity = shopperIdentity;
    }

    private setSdkForPerformingShopperIdentityValidation(sdk: ISrcInitiator) {
        console.log('SDK chosen:', sdk.schemaName);
        this.validationSchemaSdk = sdk;
    }

    public get maskedCards() {
        return this.srcProfile?.maskedCards;
    }

    public get maskedShopperContact(): string | undefined {
        return this.shopperMaskedValidationData?.maskedValidationChannel;
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

            if (isEnrolled) {
                this.setState(CtpState.ShopperIdentified);
                return;
            }
            this.setState(CtpState.NotAvailable);
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
    public async startIdentityValidation(): Promise<void> {
        if (!this.validationSchemaSdk) {
            throw Error('initiateIdentityValidation: No schema set for the validation process');
        }
        this.shopperMaskedValidationData = await this.validationSchemaSdk.initiateIdentityValidation();
        this.setState(CtpState.OneTimePassword);
    }

    // public abortIdentityValidation() {
    //     this.setState(CtpState.AwaitingSignIn);
    // }

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

        console.log('srcProfiles', srcProfiles);

        const cards = createShopperCardsList(srcProfiles);
        console.log('cards', cards);
        this.shopperCards = cards;

        // TODO: verify when APi return multiple profiles. What to do with that?
        // // For now it is taking only the first one of the first response
        // this.srcProfile = srcProfiles[0]?.profiles[0];
        // this.srcCorrelationId = srcProfiles[0]?.srcCorrelationId;

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
        return new Promise((resolve, reject) => {
            const promises = this.sdks.map(sdk => {
                const isRecognizedPromise = sdk.isRecognized();
                isRecognizedPromise.then(response => response.recognized && resolve(response));
                return isRecognizedPromise;
            });

            Promise.all(promises)
                .then(() => resolve({ recognized: false }))
                .catch(error => reject(error));
        });
    }

    /**
     * Call the identityLookup() method of each SRC SDK.
     *
     * Based on the responses from the Click to Pay Systems, we should call the initiateIdentityValidation() SDK method
     * of the Click to Pay System that responds first with consumerPresent response to the identityLookup() call.
     */
    private async identifyShopper(): Promise<{ isEnrolled: boolean }> {
        return new Promise((resolve, reject) => {
            const lookupPromises = this.sdks.map(sdk => {
                const identityLookupPromise = sdk.identityLookup({ value: this.shopperIdentity.value, type: this.shopperIdentity.type });

                identityLookupPromise.then(response => {
                    console.log(sdk.schemaName, response);
                    if (response.consumerPresent && !this.validationSchemaSdk) {
                        this.setSdkForPerformingShopperIdentityValidation(sdk);
                        resolve({ isEnrolled: true });
                    }
                });

                return identityLookupPromise;
            });

            Promise.all(lookupPromises)
                .then(() => resolve({ isEnrolled: false }))
                .catch(error => reject(error));
            // Error can be: FRAUD, ID_FORMAT_UNSUPPORTED, CONSUMER_ID_MISSING, ACCT_INACCESSIBLE
        });
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
