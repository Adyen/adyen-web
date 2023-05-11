import { ISrcInitiator } from './sdks/AbstractSrcInitiator';
import {
    CallbackStateSubscriber,
    IClickToPayService,
    IdentityLookupParams,
    ClickToPayCheckoutPayload,
    SrcProfileWithScheme,
    SchemesConfiguration,
    IdentityValidationData
} from './types';
import { ISrcSdkLoader } from './sdks/SrcSdkLoader';
import { createCheckoutPayloadBasedOnScheme, createShopperCardsList, CTP_IFRAME_NAME } from './utils';
import { SrciIsRecognizedResponse, SrcProfile } from './sdks/types';
import SrciError from './sdks/SrciError';
import { SchemeNames } from './sdks/utils';
import ShopperCard from '../models/ShopperCard';
import uuidv4 from '../../../../utils/uuid';
import AdyenCheckoutError from '../../../../core/Errors/AdyenCheckoutError';
import { isFulfilled, isRejected } from '../../../../utils/promise-util';

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
    private readonly schemesConfig: SchemesConfiguration;
    private readonly shopperIdentity?: IdentityLookupParams;
    private readonly environment: string;

    /**
     * Mandatory unique ID passed to all the networks (Click to Pay systems), used to track user journey
     */
    private readonly srciTransactionId: string = uuidv4();

    private sdks: ISrcInitiator[];
    private validationSchemeSdk: ISrcInitiator = null;
    private stateSubscriber: CallbackStateSubscriber;

    public state: CtpState = CtpState.Idle;
    public shopperCards: ShopperCard[] = null;
    public identityValidationData: IdentityValidationData = null;

    constructor(schemesConfig: SchemesConfiguration, sdkLoader: ISrcSdkLoader, environment: string, shopperIdentity?: IdentityLookupParams) {
        this.sdkLoader = sdkLoader;
        this.schemesConfig = schemesConfig;
        this.shopperIdentity = shopperIdentity;
        this.environment = environment;
    }

    public get schemes(): string[] {
        return this.sdkLoader.schemes;
    }

    public async initialize(): Promise<void> {
        this.setState(CtpState.Loading);

        try {
            this.sdks = await this.sdkLoader.load(this.environment);
            await this.initiateSdks();
            const { recognized = false, idTokens = null } = await this.verifyIfShopperIsRecognized();

            if (recognized) {
                await this.getShopperProfile(idTokens);
                this.setState(CtpState.Ready);
                return;
            }

            if (!this.shopperIdentity) {
                this.setState(CtpState.NotAvailable);
                return;
            }

            const { isEnrolled } = await this.verifyIfShopperIsEnrolled(this.shopperIdentity);
            if (isEnrolled) {
                this.setState(CtpState.ShopperIdentified);
                return;
            }

            this.setState(CtpState.NotAvailable);
        } catch (error) {
            if (error instanceof SrciError)
                console.warn(`Error at ClickToPayService: Reason: ${error.reason} / Source: ${error.source} / Scheme: ${error.scheme}`);
            else console.warn(error);

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

        this.identityValidationData = {
            maskedShopperContact: maskedValidationChannel.replace(/\*/g, '•'),
            selectedNetwork: SchemeNames[this.validationSchemeSdk.schemeName]
        };

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
        this.setState(CtpState.Ready);

        this.validationSchemeSdk = null;
    }

    /**
     * This method performs checkout using the selected card
     */
    public async checkout(card: ShopperCard): Promise<ClickToPayCheckoutPayload> {
        if (!card) {
            throw Error('ClickToPayService # checkout: Missing card data');
        }

        const checkoutSdk = this.sdks.find(sdk => sdk.schemeName === card.scheme);

        const checkoutResponse = await checkoutSdk.checkout({
            srcDigitalCardId: card.srcDigitalCardId,
            srcCorrelationId: card.srcCorrelationId,
            ...(card.isDcfPopupEmbedded && { windowRef: window.frames[CTP_IFRAME_NAME] })
        });

        if (checkoutResponse.dcfActionCode !== 'COMPLETE') {
            throw new AdyenCheckoutError(
                'ERROR',
                `Checkout through Scheme DCF did not complete. DCF Action code received: ${checkoutResponse.dcfActionCode}`
            );
        }

        return createCheckoutPayloadBasedOnScheme(card, checkoutResponse, this.environment);
    }

    /**
     * Call the 'unbindAppInstance()' method of each SRC SDK in order to remove the shopper cookies.
     * Besides, it deletes all information stored about the shopper.
     */
    public async logout(): Promise<void> {
        if (!this.sdks) {
            throw new AdyenCheckoutError('ERROR', 'ClickToPayService is not initialized');
        }

        const logoutPromises = this.sdks.map(sdk => sdk.unbindAppInstance());

        await Promise.all(logoutPromises);

        this.shopperCards = null;
        this.identityValidationData = null;
        this.validationSchemeSdk = null;

        this.setState(CtpState.Login);
    }

    /**
     * Call the 'identityLookup()' method of each SRC SDK in order to verify if the shopper has an account.
     *
     * Based on the responses from the Click to Pay Systems, we should do the validation process using the SDK that
     * that responds faster with 'consumerPresent=true'
     */
    public async verifyIfShopperIsEnrolled(shopperIdentity: IdentityLookupParams): Promise<{ isEnrolled: boolean }> {
        const { shopperEmail } = shopperIdentity;

        return new Promise((resolve, reject) => {
            const lookupPromises = this.sdks.map(sdk => {
                const identityLookupPromise = sdk.identityLookup({ identityValue: shopperEmail, type: 'email' });

                identityLookupPromise
                    .then(response => {
                        if (response.consumerPresent && !this.validationSchemeSdk) {
                            this.setSdkForPerformingShopperIdentityValidation(sdk);
                            resolve({ isEnrolled: true });
                        }
                    })
                    .catch(error => {
                        reject(error);
                    });

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
        this.validationSchemeSdk = sdk;
    }

    /**
     * Based on the given 'idToken', this method goes through each SRCi SDK and fetches the shopper
     * profile with his cards.
     */
    private async getShopperProfile(idTokens: string[]): Promise<void> {
        return new Promise((resolve, reject) => {
            const srcProfilesPromises = this.sdks.map(sdk => sdk.getSrcProfile(idTokens));

            Promise.allSettled(srcProfilesPromises).then(srcProfilesResponses => {
                if (srcProfilesResponses.every(isRejected)) {
                    reject(srcProfilesResponses[0].reason);
                }

                const createProfileWithScheme = (promiseResult: PromiseSettledResult<SrcProfile>, index) =>
                    isFulfilled(promiseResult) && { ...promiseResult.value, scheme: this.sdks[index].schemeName };

                const profilesWithScheme: SrcProfileWithScheme[] = srcProfilesResponses.map(createProfileWithScheme).filter(profile => !!profile);

                this.shopperCards = createShopperCardsList(profilesWithScheme);
                resolve();
            });
        });
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
