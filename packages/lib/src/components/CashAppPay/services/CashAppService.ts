import { ICashAppSdkLoader } from './CashAppSdkLoader';
import AdyenCheckoutError from '../../../core/Errors/AdyenCheckoutError';
import { CashAppPayEvents, CashAppServiceConfig, ICashAppSDK, ICashAppService } from './types';

class CashAppService implements ICashAppService {
    private readonly sdkLoader: ICashAppSdkLoader;
    private readonly configuration: CashAppServiceConfig;

    private pay: ICashAppSDK;

    private customerRequest;
    private startAuthorization?: () => void;
    private updateRequest?: () => void;

    constructor(sdkLoader: ICashAppSdkLoader, configuration: CashAppServiceConfig) {
        this.configuration = configuration;
        this.sdkLoader = sdkLoader;
    }

    get hasOneTimePayment() {
        const { amount } = this.configuration;
        return amount?.value > 0;
    }

    get hasOnFilePayment() {
        return this.configuration.storePaymentMethod;
    }

    public setStorePaymentMethod(store: boolean) {
        this.configuration.storePaymentMethod = store;
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
            const { button, useCashAppButtonUi } = this.configuration;

            const { begin } = await this.pay.render(target, {
                manage: false,
                button: useCashAppButtonUi ? { width: 'full', shape: 'semiround', ...button } : false
            });
            this.startAuthorization = begin;
        } catch (error) {
            throw new AdyenCheckoutError('ERROR', 'Error rendering CashAppPay button', { cause: error });
        }
    }

    public begin(): void {
        if (!this.startAuthorization) console.warn('CashAppService - begin() not available');
        else this.startAuthorization();
    }

    // public async addOnFileAction(): Promise<void> {
    //     if (!this.updateRequest) return Promise.reject();
    //
    //     this.customerRequest.actions = {
    //         ...this.customerRequest.actions,
    //         onFile: {
    //             scopeId: this.configuration.scopeId
    //         }
    //     };
    //     const success = await this.updateRequest(this.customerRequest);
    //
    //     if (success) return Promise.resolve();
    //     return Promise.reject();
    // }
    //
    // public async removeOnFileAction(): Promise<void> {
    //     if (!this.updateRequest) return Promise.reject();
    //
    //     delete this.customerRequest.actions.onFile;
    //     const success = await this.updateRequest(this.customerRequest);
    //
    //     if (success) return Promise.resolve();
    //     return Promise.reject();
    // }

    public subscribeToEvent(eventType: CashAppPayEvents, callback: Function): Function {
        this.pay.addEventListener(eventType, callback);
        return () => {
            this.pay.removeEventListener(eventType, callback);
        };
    }

    public async createCustomerRequest(): Promise<void> {
        try {
            const { referenceId, amount, scopeId, redirectURL = window.location.href } = this.configuration;

            const customerRequest = {
                referenceId,
                redirectURL,
                actions: {
                    ...(this.hasOneTimePayment && {
                        payment: {
                            amount,
                            scopeId
                        }
                    }),
                    ...(this.hasOnFilePayment && {
                        onFile: {
                            scopeId
                        }
                    })
                }
            };
            // const { update } = await this.pay.customerRequest(customerRequest);
            await this.pay.customerRequest(customerRequest);

            console.log(customerRequest);

            // this.customerRequest = customerRequest;
            // this.updateRequest = update;
        } catch (error) {
            throw new AdyenCheckoutError('ERROR', 'Something went wrong during customerRequest creation', { cause: error });
        }
    }

    public async restart(): Promise<void> {
        await this.pay.restart();
    }
}

export { CashAppService };
