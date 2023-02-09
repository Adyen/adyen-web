import { ICashAppSdkLoader } from './CashAppSdkLoader';
import { PaymentAmount } from '../../../types';
import AdyenCheckoutError from '../../../core/Errors/AdyenCheckoutError';
import { ICashAppSDK } from './types';

export interface ICashAppService {
    initialize(target: HTMLElement): Promise<void>;
    restart(): Promise<void>;
    createCustomerRequest(): Promise<void>;
    subscribeToEvent(eventType: CashAppPayEvents, callback: Function): Function;
    //
    // // https://developers.cash.app/docs/api/technical-documentation/sdks/pay-kit/technical-reference#addeventlistener
    // subscribeForCustomerInteraction();
    // subscribeForCustomerDismissed();
    // subscribeForCustomerRequestApproved();
    // subscribeForCustomerRequestDeclined();
    // subscribeForCustomerRequestFailed();
}

export enum CashAppPayEvents {
    CustomerDismissed = 'CUSTOMER_DISMISSED',
    CustomerRequestApproved = 'CUSTOMER_REQUEST_APPROVED',
    CustomerRequestDeclined = 'CUSTOMER_REQUEST_DECLINED',
    CustomerRequestFailed = 'CUSTOMER_REQUEST_FAILED'
}

type CashAppServiceConfig = {
    environment: string;
    clientId: string;
    scopeId: string;
    amount: PaymentAmount;
    referenceId?: string;
    button?: {
        shape?: 'semiround' | 'round';
        size?: 'medium' | 'small';
        theme?: 'dark' | 'light';
        width?: 'static' | 'full';
    };
};

class CashAppService implements ICashAppService {
    private readonly sdkLoader: ICashAppSdkLoader;
    private readonly configuration: CashAppServiceConfig;
    private pay: ICashAppSDK;

    constructor(sdkLoader: ICashAppSdkLoader, configuration: CashAppServiceConfig) {
        this.configuration = configuration;
        this.sdkLoader = sdkLoader;
    }

    get isOneTimePayment() {
        const { amount } = this.configuration;
        return amount?.value > 0;
    }

    public async initialize(target: HTMLElement): Promise<void> {
        try {
            const { environment, clientId, button } = this.configuration;
            const cashApp = await this.sdkLoader.load(environment);
            this.pay = await cashApp.pay({ clientId });
            await this.pay.render(target, { button: { width: 'full', shape: 'semiround', ...button } });
        } catch (error) {
            throw new AdyenCheckoutError('ERROR', 'Error during initialization', { cause: error });
        }
    }

    public subscribeToEvent(eventType, callback) {
        this.pay.addEventListener(eventType, callback);
        return () => {
            this.pay.addEventListener(eventType, callback);
        };
    }

    public async createCustomerRequest(): Promise<void> {
        try {
            const { referenceId, amount, scopeId } = this.configuration;

            await this.pay.customerRequest({
                referenceId,
                redirectURL: window.location.href,
                actions: {
                    ...(this.isOneTimePayment
                        ? {
                              payment: {
                                  amount,
                                  scopeId
                              }
                          }
                        : {
                              onFile: {
                                  scopeId
                              }
                          })
                }
            });
        } catch (error) {
            throw new AdyenCheckoutError('ERROR', 'Something went wrong during customerRequest creation', { cause: error });
        }
    }

    public async restart(): Promise<void> {
        await this.pay.restart();
    }
}

export { CashAppService };
