import AdyenCheckoutError from '../../../core/Errors/AdyenCheckoutError';
import { PayPayInitOptions } from '../types';

class PayPayService {
    private readonly clientId: string;
    private readonly environment: string;

    constructor({ clientId, environment }: { clientId: string; environment: string }) {
        this.clientId = clientId;
        this.environment = environment;
    }

    public initialize = ({ containerId }: { containerId: string }): void => {
        try {
            const env = this.environment.includes('live') ? 'production' : 'sandbox';

            const options: PayPayInitOptions = {
                clientId: this.clientId,
                env,
                success: res => {
                    console.log('PayPay success', res);
                },
                fail: res => {
                    console.log('PayPay fail', res);
                    this.renderLoginButton({ containerId });
                }
            };

            console.log('PayPay init options:', options);
            console.log('PayPay init invoked');
            window.pp.init(options);
        } catch (error: unknown) {
            throw new AdyenCheckoutError('ERROR', 'PayPay SDK init() failed', { cause: error });
        }
    };

    public renderLoginButton = ({ containerId }: { containerId: string }) => {
        window.pp.renderButton({
            containerId: containerId,
            locale: 'en'
            // postLoginRedirectUrl
        });
    };
}

export default PayPayService;
