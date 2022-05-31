import { ISrcInitiator } from './sdks/AbstractSrcInitiator';
import { CallbackStateSubscriber, IClickToPayService, ShopperCard, IdentityLookupParams, CheckoutPayload, SrcProfileWithScheme } from './types';
import { ISrcSdkLoader } from './sdks/SrcSdkLoader';
import { createCheckoutPayloadBasedOnScheme, createShopperCardsList } from './utils';
import { SrciIsRecognizedResponse, SrcInitParams } from './sdks/types';

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
    private readonly schemesConfig: Record<string, SrcInitParams>;
    private readonly shopperIdentity?: IdentityLookupParams;
    private sdks: ISrcInitiator[];
    private validationSchemeSdk: ISrcInitiator = null;
    private stateSubscriber: CallbackStateSubscriber;

    public state: CtpState = CtpState.Idle;
    public shopperCards: ShopperCard[] = null;
    public shopperValidationContact: string;

    constructor(schemesConfig: Record<'mastercard' | 'visa', SrcInitParams>, sdkLoader: ISrcSdkLoader, shopperIdentity?: IdentityLookupParams) {
        this.sdkLoader = sdkLoader;
        this.schemesConfig = schemesConfig;
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
        if (!this.validationSchemeSdk) {
            throw Error('startIdentityValidation: No ValidationSDK set for the validation process');
        }

        const { maskedValidationChannel } = await this.validationSchemeSdk.initiateIdentityValidation();
        this.shopperValidationContact = maskedValidationChannel.replaceAll('*', '•');

        this.setState(CtpState.OneTimePassword);
    }

    /**
     * Completes the  validation of the Shopper by evaluating the supplied OTP.
     */
    public async finishIdentityValidation(otpCode: string): Promise<void> {
        if (!this.validationSchemeSdk) {
            throw Error('finishIdentityValidation: No ValidationSDK set for the validation process');
        }
        const validationToken = await this.validationSchemeSdk.completeIdentityValidation(otpCode);
        await this.getShopperProfile([validationToken.idToken]);

        this.validationSchemeSdk = null;
    }

    /**
     * This method performs checkout using the selected card
     */
    public async checkout(card: ShopperCard): Promise<CheckoutPayload> {
        if (!card) {
            throw Error('ClickToPayService # checkout: Missing card data');
        }

        const checkoutParameters = {
            srcDigitalCardId: card.srcDigitalCardId,
            srcCorrelationId: card.srcCorrelationId
        };

        const checkoutSdk = this.sdks.find(sdk => sdk.schemeName === card.scheme);
        const checkoutResponse = await checkoutSdk.checkout(checkoutParameters);

        console.log(checkoutResponse);

        return createCheckoutPayloadBasedOnScheme(card, checkoutResponse);
    }

    private setState(state: CtpState): void {
        this.state = state;
        this.stateSubscriber?.(this.state);
    }

    private setSdkForPerformingShopperIdentityValidation(sdk: ISrcInitiator) {
        console.log('SDK chosen:', sdk.schemeName);
        this.validationSchemeSdk = sdk;
    }

    /**
     * Based on the given idToken, this method goes through each SRCi SDK and fetches the shopper
     * profile with his cards
     */
    private async getShopperProfile(idTokens: string[]): Promise<void> {
        const srcProfilesPromises = this.sdks.map(sdk => sdk.getSrcProfile(idTokens));
        const srcProfiles = await Promise.all(srcProfilesPromises);
        const profilesWithScheme = srcProfiles.map<SrcProfileWithScheme>((profile, index) => ({ ...profile, scheme: this.sdks[index].schemeName }));
        const cards = createShopperCardsList(profilesWithScheme);
        this.shopperCards = cards;
        this.setState(CtpState.Ready);
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
                    console.log(sdk.schemeName, response);
                    if (response.consumerPresent && !this.validationSchemeSdk) {
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
            const cfg = this.schemesConfig[sdk.schemeName];
            return sdk.init(cfg);
        });
        await Promise.all(initPromises);
    }
}

export default ClickToPayService;
