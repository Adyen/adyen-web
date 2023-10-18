import { AdyenCheckout, WeChat, BcmcMobile, Swish, PromptPay, PayNow, DuitNow } from '@adyen/adyen-web';
import '@adyen/adyen-web/styles/adyen.css';
import { makePayment } from '../../services';
import { shopperLocale } from '../../config/commonConfig';
import '../../../config/polyfills';
import '../../utils';
import '../../style.scss';
import './QRCodes.scss';
import { handleResponse } from '../../handlers';
import getCurrency from '../../config/getCurrency';
import getTranslationFile from '../../config/getTranslation';

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
        translationFile: getTranslationFile(shopperLocale),
        environment: process.env.__CLIENT_ENV__,
        risk: { node: 'body', onError: console.error }
    });

    // WechatPay QR
    new WeChat({
        core: checkout,
        type: 'wechatpayQR',
        onSubmit: (state, component) => {
            return makeQRCodePayment(state, component, 'CN');
        }
    }).mount('#wechatpayqr-container');

    // BCMC Mobile
    new BcmcMobile({
        core: checkout,
        onSubmit: (state, component) => {
            return makeQRCodePayment(state, component, 'BE');
        }
    }).mount('#bcmcqr-container');

    new Swish({
        core: checkout,
        onSubmit: (state, component) => {
            return makeQRCodePayment(state, component, 'SE');
        }
    }).mount('#swish-container');

    new PromptPay({
        core: checkout,
        onSubmit: (state, component) => {
            return makeQRCodePayment(state, component, 'TH');
        }
    }).mount('#promptpay-container');

    new PayNow({
        core: checkout,
        onSubmit: (state, component) => {
            return makeQRCodePayment(state, component, 'SG');
        }
    }).mount('#paynow-container');

    new DuitNow({
        core: checkout,
        onSubmit: (state, component) => {
            return makeQRCodePayment(state, component, 'MY');
        }
    }).mount('#duitnow-container');
})();
