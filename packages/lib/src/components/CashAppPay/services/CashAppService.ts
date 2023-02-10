import { ICashAppSdkLoader } from './CashAppSdkLoader';
import AdyenCheckoutError from '../../../core/Errors/AdyenCheckoutError';
import { CashAppPayEvents, CashAppServiceConfig, ICashAppSDK, ICashAppService } from './types';

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

    public async initialize(): Promise<void> {
        try {
            const { environment, clientId } = this.configuration;
            const cashApp = await this.sdkLoader.load(environment);
            this.pay = await cashApp.pay({ clientId });
        } catch (error) {
            throw new AdyenCheckoutError('ERROR', 'Error during initialization', { cause: error });
        }
    }

    public async renderButton(target: HTMLElement): Promise<void> {
        try {
            const { button } = this.configuration;
            await this.pay.render(target, { button: { width: 'full', shape: 'semiround', ...button } });
        } catch (error) {
            throw new AdyenCheckoutError('ERROR', 'Error rendering CashAppPay button', { cause: error });
        }
    }

    public subscribeToEvent(eventType: CashAppPayEvents, callback: Function): Function {
        this.pay.addEventListener(eventType, callback);
        return () => {
            this.pay.removeEventListener(eventType, callback);
        };
    }

    public async createCustomerRequest(): Promise<void> {
        try {
            const { referenceId, amount, scopeId, redirectURL = window.location.href } = this.configuration;

            await this.pay.customerRequest({
                referenceId,
                redirectURL,
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
