import { ISrcInitiator } from './sdks/AbstractSrcInitiator';
import { CallbackStateSubscriber, IClickToPayService, IdentityLookupParams, ClickToPayCheckoutPayload, SrcProfileWithScheme } from './types';
import { ISrcSdkLoader } from './sdks/SrcSdkLoader';
import { createCheckoutPayloadBasedOnScheme, createShopperCardsList } from './utils';
import { SrciIsRecognizedResponse, SrcInitParams } from './sdks/types';
import { ClickToPayScheme } from '../../../types';
import ShopperCard from '../models/ShopperCard';
import AdyenCheckoutError from '../../../../../core/Errors/AdyenCheckoutError';
import uuidv4 from '../../../../../utils/uuid';

export enum CtpState {
    Idle = 'Idle',
    Loading = 'Loading',
    ShopperIdentified = 'ShopperIdentified',
    OneTimePassword = 'OneTimePassword',
    Ready = 'Ready',
    Login = 'Login',
    NotAvailable = 'NotAvailable'
}

class ClickToPayService implements IClickToPayService {
    private readonly sdkLoader: ISrcSdkLoader;
    private readonly schemesConfig: Record<string, SrcInitParams>;
    private readonly shopperIdentity?: IdentityLookupParams;

    /**
     * Mandatory unique ID passed to all the networks (Click to Pay systems), used to track user journey
     */
    private readonly srciTransactionId: string = uuidv4();

    private sdks: ISrcInitiator[];
    private validationSchemeSdk: ISrcInitiator = null;
    private stateSubscriber: CallbackStateSubscriber;

    public state: CtpState = CtpState.Idle;
    public shopperCards: ShopperCard[] = null;
    public shopperValidationContact: string;

    constructor(schemesConfig: Record<ClickToPayScheme, SrcInitParams>, sdkLoader: ISrcSdkLoader, shopperIdentity?: IdentityLookupParams) {
        this.sdkLoader = sdkLoader;
        this.schemesConfig = schemesConfig;
        this.shopperIdentity = shopperIdentity;
    }

    public get schemes(): string[] {
        return this.sdkLoader.schemes;
    }

    public async initialize(): Promise<void> {
        this.setState(CtpState.Loading);

        try {
            this.sdks = await this.sdkLoader.load();

            await this.initiateSdks();
            console.log('after initiate');

            const { recognized = false, idTokens = null } = await this.verifyIfShopperIsRecognized();
            console.log('after verifyIfShopperIsRecognized');

            if (recognized) {
                await this.getShopperProfile(idTokens);
                console.log('after getShopperProfile');

                this.setState(CtpState.Ready);
                return;
            }

            if (!this.shopperIdentity) {
                this.setState(CtpState.NotAvailable);
                console.log('after !this.shopperIdentity)');
                return;
            }

            const { isEnrolled } = await this.verifyIfShopperIsEnrolled(this.shopperIdentity.value, this.shopperIdentity.type);
            console.log('after this.verifyIfShopperIsEnrolled)');

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
    public async checkout(card: ShopperCard): Promise<ClickToPayCheckoutPayload> {
        if (!card) {
            throw Error('ClickToPayService # checkout: Missing card data');
        }

        const checkoutParameters = {
            srcDigitalCardId: card.srcDigitalCardId,
            srcCorrelationId: card.srcCorrelationId
        };

        const checkoutSdk = this.sdks.find(sdk => sdk.schemeName === card.scheme);
        const checkoutResponse = await checkoutSdk.checkout(checkoutParameters);

        if (checkoutResponse.dcfActionCode !== 'COMPLETE') {
            throw new AdyenCheckoutError(
                'ERROR',
                `Checkout through Scheme DCF did not complete. DCF Action code received: ${checkoutResponse.dcfActionCode}`
            );
        }

        return createCheckoutPayloadBasedOnScheme(card, checkoutResponse);
    }

    /**
     * Call the 'unbindAppInstance()' method of each SRC SDK in order to remove the shopper cookies.
     * Besides, it deletes all information stored about the shopper.
     */
    public async logout(): Promise<void> {
        const logoutPromises = this.sdks.map(sdk => sdk.unbindAppInstance());

        await Promise.all(logoutPromises);

        this.shopperCards = null;
        this.shopperValidationContact = null;
        this.validationSchemeSdk = null;

        this.setState(CtpState.Login);
    }

    /**
     * Call the 'identityLookup()' method of each SRC SDK in order to verify if the shopper has an account.
     *
     * Based on the responses from the Click to Pay Systems, we should do the validation process using the SDK that
     * that responds faster with 'consumerPresent=true'
     */
    public async verifyIfShopperIsEnrolled(value: string, type: 'email' | 'mobilePhone' = 'email'): Promise<{ isEnrolled: boolean }> {
        return new Promise((resolve, reject) => {
            const lookupPromises = this.sdks.map(sdk => {
                const identityLookupPromise = sdk.identityLookup({ value, type });

                identityLookupPromise
                    .then(response => {
                        console.log(sdk.schemeName, response);
                        if (response.consumerPresent && !this.validationSchemeSdk) {
                            this.setSdkForPerformingShopperIdentityValidation(sdk);
                            resolve({ isEnrolled: true });
                        }
                    })
                    .catch(error => reject(error));

                return identityLookupPromise;
            });

            Promise.allSettled(lookupPromises).then(() => {
                resolve({ isEnrolled: false });
            });
        });
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
    private async verifyIfShopperIsRecognized(): Promise<SrciIsRecognizedResponse> {
        return new Promise((resolve, reject) => {
            const promises = this.sdks.map(sdk => {
                const isRecognizedPromise = sdk.isRecognized();
                isRecognizedPromise.then(response => response.recognized && resolve(response)).catch(error => reject(error));
                return isRecognizedPromise;
            });

            Promise.allSettled(promises).then(() => resolve({ recognized: false }));
        });
    }

    private async initiateSdks(): Promise<void> {
        const initPromises = this.sdks.map(sdk => {
            const cfg = this.schemesConfig[sdk.schemeName];
            return sdk.init(cfg, this.srciTransactionId);
        });
        await Promise.all(initPromises);
    }
}

export default ClickToPayService;
