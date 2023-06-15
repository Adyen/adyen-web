import AdyenCheckout from '@adyen/adyen-web';
import '@adyen/adyen-web/dist/es/adyen.css';
import { makePayment } from '../../services';
import { shopperLocale } from '../../config/commonConfig';
import '../../../config/polyfills';
import '../../utils';
import '../../style.scss';
import './QRCodes.scss';
import { handleSubmit } from '../../handlers';
(async () => {
    window.checkout = await AdyenCheckout({
        clientKey: process.env.__CLIENT_KEY__,
        locale: shopperLocale,
        environment: process.env.__CLIENT_ENV__,
        risk: { node: 'body', onError: console.error },
        onSubmit: handleSubmit
    });

    // WechatPay QR
    makePayment({
        paymentMethod: {
            type: 'wechatpayQR'
        },
        countryCode: 'CN',
        amount: {
            currency: 'CNY',
            value: 1000
        }
    })
        .then(result => {
            if (result.action) {
                window.wechatpayqr = checkout.createFromAction(result.action).mount('#wechatpayqr-container');
            }
        })
        .catch(error => {
            throw Error(error);
        });

    // BCMC Mobile
    makePayment({
        paymentMethod: {
            type: 'bcmc_mobile_QR'
        },
        countryCode: 'BE',
        amount: {
            currency: 'EUR',
            value: 1000
        }
    })
        .then(result => {
            if (result.action) {
                window.bcmcmobileqr = checkout.createFromAction(result.action).mount('#bcmcqr-container');
            }
        })
        .catch(error => {
            throw Error(error);
        });

    // Test with: https://localhost:3020/qrcodes/?countryCode=SE
    checkout.create('swish').mount('#swish-container');

    // Test with: https://localhost:3020/qrcodes/?countryCode=TH
    checkout.create('promptpay').mount('#promptpay-container');

    // Test with: https://localhost:3020/qrcodes/?countryCode=SG
    checkout.create('paynow').mount('#paynow-container');

    // Test with: https://localhost:3020/qrcodes/?countryCode=MY
    checkout.create('duitnow').mount('#duitnow-container');
})();
