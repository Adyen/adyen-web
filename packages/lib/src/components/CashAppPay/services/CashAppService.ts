import { ICashAppSdkLoader } from './CashAppSdkLoader';
import AdyenCheckoutError from '../../../core/Errors/AdyenCheckoutError';
import { CashAppPayEvents, CashAppServiceConfig, ICashAppSDK, ICashAppService } from './types';
import { PaymentAmount } from '../../../types';

export default class CashAppService implements ICashAppService {
    private readonly sdkLoader: ICashAppSdkLoader;
    private readonly configuration: CashAppServiceConfig;

    private pay: ICashAppSDK;

    /**
     * Reference to CashApp 'begin' method
     */
    private startAuthorization?: () => void;

    constructor(sdkLoader: ICashAppSdkLoader, configuration: CashAppServiceConfig) {
        this.configuration = configuration;
        this.sdkLoader = sdkLoader;

        if (!configuration.clientId) {
            console.warn('CashAppService: clientId is missing');
        }
    }

    private isOneTimePayment(amount: PaymentAmount): boolean {
        return amount?.value > 0;
    }

    private isOnFilePayment(): boolean {
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

    public subscribeToEvent(eventType: CashAppPayEvents, callback: Function): Function {
        this.pay.addEventListener(eventType, callback);
        return () => {
            this.pay.removeEventListener(eventType, callback);
        };
    }

    public async createCustomerRequest(amount: PaymentAmount): Promise<void> {
        try {
            const { referenceId, scopeId, redirectURL = window.location.href } = this.configuration;

            const customerRequest = {
                referenceId,
                redirectURL,
                actions: {
                    ...(this.isOneTimePayment(amount) && {
                        payment: {
                            amount,
                            scopeId
                        }
                    }),
                    ...(this.isOnFilePayment() && {
                        onFile: {
                            scopeId
                        }
                    })
                }
            };
            await this.pay.customerRequest(customerRequest);
        } catch (error) {
            throw new AdyenCheckoutError('ERROR', 'Something went wrong during customerRequest creation', { cause: error });
        }
    }

    public async restart(): Promise<void> {
        await this.pay.restart();
    }
}
