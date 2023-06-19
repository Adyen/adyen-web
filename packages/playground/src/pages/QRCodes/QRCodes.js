import AdyenCheckout from '@adyen/adyen-web';
import '@adyen/adyen-web/dist/es/adyen.css';
import { makePayment } from '../../services';
import { shopperLocale } from '../../config/commonConfig';
import '../../../config/polyfills';
import '../../utils';
import '../../style.scss';
import './QRCodes.scss';
import { handleResponse } from '../../handlers';
import getCurrency from '../../config/getCurrency';

const makeQRCodePayment = (state, component, countryCode) => {
    const currency = getCurrency(countryCode);
    const config = { countryCode, amount: { currency, value: 25940 } };

    return makePayment(state.data, config)
        .then(response => {
            component.setStatus('ready');
            handleResponse(response, component);
        })
        .catch(error => {
            throw Error(error);
        });
};

(async () => {
    window.checkout = await AdyenCheckout({
        clientKey: process.env.__CLIENT_KEY__,
        locale: shopperLocale,
        environment: process.env.__CLIENT_ENV__,
        risk: { node: 'body', onError: console.error }
        // onSubmit: handleSubmit
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
    checkout
        .create('bcmc_mobile_QR', {
            onSubmit: (state, component) => {
                return makeQRCodePayment(state, component, 'BE');
            }
        })
        .mount('#bcmcqr-container');

    checkout
        .create('swish', {
            onSubmit: (state, component) => {
                return makeQRCodePayment(state, component, 'SE');
            }
        })
        .mount('#swish-container');

    checkout
        .create('promptpay', {
            onSubmit: (state, component) => {
                return makeQRCodePayment(state, component, 'TH');
            }
        })
        .mount('#promptpay-container');

    checkout
        .create('paynow', {
            onSubmit: (state, component) => {
                return makeQRCodePayment(state, component, 'SG');
            }
        })
        .mount('#paynow-container');

    checkout
        .create('duitnow', {
            onSubmit: (state, component) => {
                return makeQRCodePayment(state, component, 'MY');
            }
        })
        .mount('#duitnow-container');
})();
