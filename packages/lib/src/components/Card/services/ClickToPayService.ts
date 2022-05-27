import { ISrcInitiator } from './sdks/AbstractSrcInitiator';
import { CallbackStateSubscriber, IClickToPayService, ShopperCard, IdentityLookupParams } from './types';
import { ISrcSdkLoader } from './sdks/SrcSdkLoader';
import { createShopperCardsList } from './utils';
import { SrciCheckoutResponse, SrciIsRecognizedResponse, SrcInitParams } from './sdks/types';

export enum CtpState {
    Idle = 'Idle',
    Loading = 'Loading',
    ShopperIdentified = 'ShopperIdentified',
    OneTimePassword = 'OneTimePassword',
    Ready = 'Ready',
    NotAvailable = 'NotAvailable'
}

class ClickToPayService implements IClickToPayService {
    private readonly sdkLoader: ISrcSdkLoader;
    private readonly schemasConfig: Record<string, SrcInitParams>;
    private readonly shopperIdentity?: IdentityLookupParams;
    private sdks: ISrcInitiator[];
    private validationSchemaSdk: ISrcInitiator = null;
    private stateSubscriber: CallbackStateSubscriber;

    public state: CtpState = CtpState.Idle;
    public shopperCards: ShopperCard[] = null;
    public shopperValidationContact: string;

    constructor(schemasConfig: Record<'mastercard' | 'visa', SrcInitParams>, sdkLoader: ISrcSdkLoader, shopperIdentity?: IdentityLookupParams) {
        this.sdkLoader = sdkLoader;
        this.schemasConfig = schemasConfig;
        this.shopperIdentity = shopperIdentity;
    }

    public async initialize(): Promise<void> {
        this.setState(CtpState.Loading);

        try {
            this.sdks = await this.sdkLoader.load();

            await this.initiateSdks();

            const { recognized = false, idTokens = null } = await this.recognizeShopper();

            if (recognized) {
                await this.getShopperProfile(idTokens);
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
            console.warn(error);
            this.setState(CtpState.NotAvailable);
        }
    }

    /**
     * Set the callback for notifying when the CtPState changes
     */
    public subscribeOnStateChange(callback: CallbackStateSubscriber): void {
        this.stateSubscriber = callback;
    }

    /**
     * Initiates Consumer Identity validation with one Click to Pay System.
     * The Click to Pay System sends a one-time-password (OTP) to the registered email address or mobile number.
     **/
    public async startIdentityValidation(): Promise<void> {
        if (!this.validationSchemaSdk) {
            throw Error('startIdentityValidation: No ValidationSDK set for the validation process');
        }

        const { maskedValidationChannel } = await this.validationSchemaSdk.initiateIdentityValidation();
        this.shopperValidationContact = maskedValidationChannel.replaceAll('*', '•');

        this.setState(CtpState.OneTimePassword);
    }

    /**
     * Completes the  validation of the Shopper by evaluating the supplied OTP.
     */
    public async finishIdentityValidation(otpCode: string): Promise<void> {
        if (!this.validationSchemaSdk) {
            throw Error('finishIdentityValidation: No ValidationSDK set for the validation process');
        }
        const validationToken = await this.validationSchemaSdk.completeIdentityValidation(otpCode);
        await this.getShopperProfile([validationToken.idToken]);

        this.validationSchemaSdk = null;
    }

    /**
     * This method performs checkout using the selected card
     */
    public async checkout(srcDigitalCardId: string, schema: string, srcCorrelationId: string): Promise<SrciCheckoutResponse> {
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

    private setState(state: CtpState): void {
        this.state = state;
        this.stateSubscriber?.(this.state);
    }

    private setSdkForPerformingShopperIdentityValidation(sdk: ISrcInitiator) {
        console.log('SDK chosen:', sdk.schemaName);
        this.validationSchemaSdk = sdk;
    }

    /**
     * Based on the given idToken, this method goes through each SRCi SDK and fetches the shopper
     * profile with his cards
     */
    private async getShopperProfile(idTokens: string[]): Promise<void> {
        const srcProfilesPromises = this.sdks.map(sdk => sdk.getSrcProfile(idTokens));
        const srcProfiles = await Promise.all(srcProfilesPromises);
        const cards = createShopperCardsList(srcProfiles);
        this.shopperCards = cards;
        this.setState(CtpState.Ready);

        console.log(srcProfiles);
    }

    /**
     * Calls the 'isRecognized()' method of each SRC SDK in order to verify if the shopper is
     * recognized on the device. The shopper is recognized if he/she has the Cookies stored
     * on their browser
     */
    private async recognizeShopper(): Promise<SrciIsRecognizedResponse> {
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
     * Call the 'identityLookup()' method of each SRC SDK in order to verify if the shopper has an account.
     *
     * Based on the responses from the Click to Pay Systems, we should do the validation process using the SDK that
     * that responds faster with 'consumerPresent=true'
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
            // TODO: Error can be: FRAUD, ID_FORMAT_UNSUPPORTED, CONSUMER_ID_MISSING, ACCT_INACCESSIBLE
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
