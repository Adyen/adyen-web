import AdyenCheckoutError from '../../../core/Errors/AdyenCheckoutError';
import PayPaySdkLoader from './PayPaySdkLoader';

class PayPayService {
    private readonly sdkLoader: PayPaySdkLoader;
    private readonly clientId: string;
    private readonly environment: string;

    constructor({ clientId, environment, sdkLoader }: { clientId: string; environment: string; sdkLoader: PayPaySdkLoader }) {
        this.sdkLoader = sdkLoader;
        this.clientId = clientId;
        this.environment = environment;
    }

    public async initialize(): Promise<unknown> {
        try {
            await this.sdkLoader.load();

            return new Promise<unknown>((resolve, reject) => {
                const environment = this.environment.includes('live') ? 'production' : 'sandbox';

                window.pp.init({
                    clientId: this.clientId,
                    environment,
                    success(res) {
                        console.log('PayPay success', res);
                        resolve(res);
                    },
                    fail(res) {
                        console.log('PayPay fail', res);
                        reject(res);
                    }
                });
            });
        } catch {
            throw new AdyenCheckoutError('ERROR', 'PayPay SDK is not loaded. Call loadSdk() first.');
        }
    }
}

export default PayPayService;
