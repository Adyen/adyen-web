import AdyenCheckoutError from '../../../core/Errors/AdyenCheckoutError';
import { PayPayInitOptions } from '../types';
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
                const env = this.environment.includes('live') ? 'production' : 'sandbox';

                const options: PayPayInitOptions = {
                    clientId: this.clientId,
                    env,
                    success(res) {
                        console.log('PayPay success', res);
                    },
                    fail(res) {
                        console.log('PayPay fail', res);
                    }
                };

                console.log('PayPay init options:', options);
                console.log('PayPay init invoked');
                window.pp.init(options);
            });
        } catch {
            throw new AdyenCheckoutError('ERROR', 'PayPay SDK is not loaded. Call loadSdk() first.');
        }
    }
}

export default PayPayService;
