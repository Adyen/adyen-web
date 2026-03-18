import AdyenCheckoutError from '../../../core/Errors/AdyenCheckoutError';
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
                },
                fail: res => {
                    console.log('PayPay fail', res);
                    this.getAuthStatus();
                }
            };

            console.log('PayPay init options:', options);
            window.pp.init(options);
        } catch (error: unknown) {
            throw new AdyenCheckoutError('ERROR', 'PayPay SDK init() failed', { cause: error });
        }
    };

    public getAuthStatus = () => {
        window.pp.getAuthStatus({
            success: () => {
                // connected
                console.log('PayPay getAuthStatus success');
            },
            fail: response => {
                // pass 'code' object to paypay backend to get login url
                console.log('PayPay getAuthStatus fail', response);
                this.renderLoginButton();
            }
        });
    };

    public renderLoginButton = () => {
        window.pp.renderButton({
            containerId: this.containerId,
            locale: 'en',
            postLoginRedirectUrl: 'https://google.com'
        });
    };

    public renderPaymentButton = () => {
        window.pp.renderButton({
            containerId: this.containerId,
            locale: 'en',
            autoInvoke: false,
            orderInfo: {
                merchantPaymentId: this.merchantId,
                amount: {
                    amount: 100,
                    currency: 'JPY'
                },
                merchantAlias: 'MERCHANT ALIAS',
                productType: 'DEFAULT',
                requestedAt: Date.now()
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
