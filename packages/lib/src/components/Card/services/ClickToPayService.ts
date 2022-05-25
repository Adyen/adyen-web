import { ISrcInitiator } from './sdks/AbstractSrcInitiator';
import { CallbackStateSubscriber, CheckoutResponse, IsRecognizedResponse, ShopperIdentity } from './types';
import { ISrcSdkLoader } from './sdks/SrcSdkLoader';
import { SecureRemoteCommerceInitResult } from './configMock';
import { createShopperCardsList, ShopperCard } from './utils';

export enum CtpState {
    Idle = 'Idle',
    Loading = 'Loading',
    ShopperIdentified = 'ShopperIdentified',
    OneTimePassword = 'OneTimePassword',
    Ready = 'Ready',
    NotAvailable = 'NotAvailable'
}

export interface IClickToPayService {
    state: CtpState;
    shopperCards: ShopperCard[];
    shopperValidationContact: string;
    initialize(): Promise<void>;
    checkout(srcDigitalCardId: string, schema: string, srcCorrelationId: string): Promise<CheckoutResponse>;
    subscribeOnStatusChange(callback: CallbackStateSubscriber): void;
    startIdentityValidation(): Promise<any>;
    finishIdentityValidation(otpCode: string): Promise<any>;
}

class ClickToPayService implements IClickToPayService {
    private readonly sdkLoader: ISrcSdkLoader;
    private readonly schemasConfig: Record<string, SecureRemoteCommerceInitResult>;
    private readonly shopperIdentity?: ShopperIdentity;
    private sdks: ISrcInitiator[];
    private validationSchemaSdk: ISrcInitiator = null;
    private stateSubscriber: CallbackStateSubscriber;

    public state: CtpState = CtpState.Idle;
    public shopperCards: ShopperCard[] = null;
    public shopperValidationContact: string;

    constructor(schemasConfig: Record<string, SecureRemoteCommerceInitResult>, sdkLoader: ISrcSdkLoader, shopperIdentity?: ShopperIdentity) {
        this.sdkLoader = sdkLoader;
        this.schemasConfig = schemasConfig;
        this.shopperIdentity = shopperIdentity;
    }

    private setSdkForPerformingShopperIdentityValidation(sdk: ISrcInitiator) {
        console.log('SDK chosen:', sdk.schemaName);
        this.validationSchemaSdk = sdk;
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

            const { isEnrolled } = await this.identifyShopper();

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
     * This method uses only the SDK that responded first on identifyShopper() call
     */
    public async startIdentityValidation(): Promise<void> {
        if (!this.validationSchemaSdk) {
            throw Error('startIdentityValidation: No schema set for the validation process');
        }

        const { maskedValidationChannel } = await this.validationSchemaSdk.initiateIdentityValidation();
        this.shopperValidationContact = maskedValidationChannel;

        this.setState(CtpState.OneTimePassword);
    }

    /**
     * Completes the validation of a Consumer Identity, by evaluating the supplied OTP.
     * This method uses only the SDK that responded first on identifyShopper() call
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
    public async checkout(srcDigitalCardId: string, schema: string, srcCorrelationId: string): Promise<CheckoutResponse> {
        if (!srcDigitalCardId || !schema || !srcCorrelationId) {
            throw Error('checkout: Missing parameter');
        }

        const checkoutParameters = {
            srcDigitalCardId,
            srcCorrelationId
        };

        const checkoutSdk = this.sdks.find(sdk => sdk.schemaName === schema);
        const checkoutResponse = await checkoutSdk.checkout(checkoutParameters);

        // TODO: figure out what happens if dcfActionCode !== COMPLETED
        console.log(checkoutResponse);
        return checkoutResponse;
    }

    private async getSecureRemoteCommerceProfile(idTokens: string[]): Promise<void> {
        const srcProfilesPromises = this.sdks.map(sdk => sdk.getSrcProfile(idTokens));
        const srcProfiles = await Promise.all(srcProfilesPromises);
        const cards = createShopperCardsList(srcProfiles);
        this.shopperCards = cards;

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
