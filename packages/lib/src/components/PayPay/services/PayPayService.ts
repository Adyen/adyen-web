import AdyenCheckoutError from '../../../core/Errors/AdyenCheckoutError';
import uuidv4 from '../../../utils/uuid';
import { PayPayInitOptions } from '../types';

class PayPayService {
    private readonly clientId: string;
    private readonly merchantId: string;
    private readonly environment: string;

    private containerId?: string;

    constructor({ clientId, merchantId, environment }: { clientId: string; merchantId: string; environment: string }) {
        this.clientId = clientId;
        this.merchantId = merchantId;
        this.environment = environment;
    }

    public initialize = ({ containerId }: { containerId: string }): void => {
        this.containerId = containerId;

        try {
            const env = this.environment.includes('live') ? 'production' : 'sandbox';

            const options: PayPayInitOptions = {
                clientId: this.clientId,
                env,
                success: res => {
                    console.log('PayPay success', res);
                    this.renderButton();
                },
                fail: res => {
                    console.log('PayPay fail', res);
                    this.renderButton();
                }
            };

            console.log('PayPay init options:', options);
            window.pp.init(options);
        } catch (error: unknown) {
            throw new AdyenCheckoutError('ERROR', 'PayPay SDK init() failed', { cause: error });
        }
    };

    public renderButton = () => {
        window.pp.renderButton({
            containerId: this.containerId,
            locale: 'en',
            autoInvoke: false,
            orderInfo: {
                merchantAlias: this.merchantId,
                merchantPaymentId: uuidv4(),
                amount: {
                    amount: 100,
                    currency: 'JPY'
                },
                productType: 'DEFAULT',
                requestedAt: Math.floor(Date.now() / 1000)
            },
            callbacks: {
                onPaymentSuccess: result => {
                    console.log('PayPay payment success', result);
                    // on payment success
                },
                onPaymentFailure: error => {
                    console.log('PayPay payment fail', error);
                    // on payment fail
                },
                onPaymentCompletion: () => {
                    console.log('PayPay payment complete');
                    // on payment complete
                }
            },
            // callback
            success: res => {
                // on render button success
                console.log('PayPay render button success', res);
            },
            fail: res => {
                // on render button fail
                console.log('PayPay render button fail', res);
            }
        });
    };
}

export default PayPayService;
