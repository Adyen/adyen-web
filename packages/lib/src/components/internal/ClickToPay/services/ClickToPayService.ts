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
import { SrciIdentityLookupResponse, SrciIsRecognizedResponse, SrcProfile } from './sdks/types';
import SrciError from './sdks/SrciError';
import { SchemeNames } from './sdks/utils';
import ShopperCard from '../models/ShopperCard';
import uuidv4 from '../../../../utils/uuid';
import AdyenCheckoutError from '../../../../core/Errors/AdyenCheckoutError';
import { isFulfilled, isRejected } from '../../../../utils/promise-util';
import TimeoutError from '../errors/TimeoutError';
import { executeWithTimeout } from './execute-with-timeout';

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

    private readonly onTimeout?: (error: TimeoutError) => void;

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

    /**
     * Indicates if the shopper opted for saving cookies during the transaction
     */
    public storeCookies = false;

    constructor(
        schemesConfig: SchemesConfiguration,
        sdkLoader: ISrcSdkLoader,
        environment: string,
        shopperIdentity?: IdentityLookupParams,
        onTimeout?: (error: TimeoutError) => void
    ) {
        this.sdkLoader = sdkLoader;
        this.schemesConfig = schemesConfig;
        this.shopperIdentity = shopperIdentity;
        this.environment = environment;
        this.onTimeout = onTimeout;
    }

    public get shopperAccountFound(): boolean {
        return [CtpState.Ready, CtpState.ShopperIdentified].includes(this.state);
    }

    public get schemes(): string[] {
        return this.sdkLoader.schemes;
    }

    public updateStoreCookiesConsent(shouldStore: boolean) {
        this.storeCookies = shouldStore;
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
            if ((error instanceof SrciError && error?.reason === 'REQUEST_TIMEOUT') || error instanceof TimeoutError) {
                this.handleTimeout(error);
            } else if (error instanceof SrciError) {
                console.warn(`Error at ClickToPayService # init: ${error.toString()}`);
            } else {
                console.warn(error);
            }

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
            ...(card.isDcfPopupEmbedded && { windowRef: window.frames[CTP_IFRAME_NAME] }),
            ...(this.storeCookies && { complianceSettings: { complianceResources: [{ complianceType: 'REMEMBER_ME', uri: '' }] } })
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

        try {
            const logoutPromises = this.sdks.map(sdk => sdk.unbindAppInstance());
            await Promise.all(logoutPromises);
        } catch (error) {
            if (error instanceof SrciError) console.warn(`Error at ClickToPayService # logout: ${error.toString()}`);
            else console.warn(error);
        }

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
    public verifyIfShopperIsEnrolled(shopperIdentity: IdentityLookupParams): Promise<{ isEnrolled: boolean }> {
        const { shopperEmail } = shopperIdentity;

        return new Promise((resolve, reject) => {
            const lookupPromises = this.sdks.map(sdk => {
                const identityLookupPromise = executeWithTimeout<SrciIdentityLookupResponse>(
                    () => sdk.identityLookup({ identityValue: shopperEmail, type: 'email' }),
                    5000,
                    new TimeoutError({
                        source: 'identityLookup',
                        scheme: sdk.schemeName,
                        isTimeoutTriggeredBySchemeSdk: false
                    })
                );

                return identityLookupPromise
                    .then(response => {
                        if (response.consumerPresent && !this.validationSchemeSdk) {
                            this.setSdkForPerformingShopperIdentityValidation(sdk);
                            resolve({ isEnrolled: true });
                        }
                    })
                    .catch(error => {
                        reject(error);
                    });
            });

            void Promise.allSettled(lookupPromises).then(() => {
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

    private handleTimeout(error: SrciError | TimeoutError) {
        // If the timeout error was thrown directly by the scheme SDK, we convert it to TimeoutError
        // If the timeout error was thrown by our internal timeout mechanism, we don't do anything
        const timeoutError =
            error instanceof SrciError
                ? new TimeoutError({ source: error.source, scheme: error.scheme, isTimeoutTriggeredBySchemeSdk: true })
                : error;

        if (timeoutError.scheme === 'visa') {
            timeoutError.setCorrelationId(window.VISA_SDK?.correlationId);

            // Visa srciDpaId must be passed when there is no correlation ID available
            if (window.VISA_SDK?.correlationId) window.VISA_SDK?.buildClientProfile?.();
            else window.VISA_SDK?.buildClientProfile?.(this.schemesConfig.visa.srciDpaId);
        }
        this.onTimeout?.(timeoutError);
    }

    /**
     * Based on the given 'idToken', this method goes through each SRCi SDK and fetches the shopper
     * profile with his cards.
     */
    private async getShopperProfile(idTokens: string[]): Promise<void> {
        return new Promise((resolve, reject) => {
            const srcProfilesPromises = this.sdks.map(sdk => sdk.getSrcProfile(idTokens));

            void Promise.allSettled(srcProfilesPromises).then(srcProfilesResponses => {
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
    private verifyIfShopperIsRecognized(): Promise<SrciIsRecognizedResponse> {
        return new Promise((resolve, reject) => {
            const promises = this.sdks.map(sdk => {
                const isRecognizedPromise = executeWithTimeout<SrciIsRecognizedResponse>(
                    () => sdk.isRecognized(),
                    5000,
                    new TimeoutError({
                        source: 'isRecognized',
                        scheme: sdk.schemeName,
                        isTimeoutTriggeredBySchemeSdk: false
                    })
                );

                return isRecognizedPromise
                    .then(response => {
                        if (response.recognized) resolve(response);
                    })
                    .catch(error => {
                        reject(error);
                    });
            });

            // If the 'resolve' didn't happen until this point, then shopper is not recognized
            void Promise.allSettled(promises).then(() => {
                resolve({ recognized: false });
            });
        });
    }

    private initiateSdks(): Promise<void[]> {
        const initPromises = this.sdks.map(sdk => {
            const cfg = this.schemesConfig[sdk.schemeName];

            return executeWithTimeout<void>(
                () => sdk.init(cfg, this.srciTransactionId),
                5000,
                new TimeoutError({
                    source: 'init',
                    scheme: sdk.schemeName,
                    isTimeoutTriggeredBySchemeSdk: false
                })
            );
        });

        return Promise.all(initPromises);
    }
}

export default ClickToPayService;
