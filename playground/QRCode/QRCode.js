import AdyenCheckout from '~';
import '../../config/polyfills';
import '../style.scss';
import './QRCode.scss';
import '../utils';
import { makePayment, getOriginKey } from '../services';
import { shopperLocale } from '../config/commonConfig';

getOriginKey().then(originKey => {
    window.originKey = originKey;

    window.checkout = new AdyenCheckout({
        originKey,
        clientKey: process.env.__CLIENT_KEY__,
        locale: shopperLocale,
        environment: 'test',
        risk: { node: 'body', onError: console.error }
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

    makePayment({
        paymentMethod: {
            type: 'swish'
        },
        countryCode: 'SE',
        amount: {
            currency: 'SEK',
            value: 1000
        }
    })
        .then(result => {
            if (result.action) {
                window.swish = checkout.createFromAction(result.action).mount('#swish-container');
            }
        })
        .catch(error => {
            throw Error(error);
        });
});
