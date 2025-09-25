import { AdyenCheckout, WeChat, BcmcMobile, Swish, PromptPay, PayNow, DuitNow } from '@adyen/adyen-web';
import '@adyen/adyen-web/styles/adyen.css';
import { makePayment } from '../../services';
import { shopperLocale, countryCode, environmentUrlsOverride } from '../../config/commonConfig';
import '../../../config/polyfills';
import '../../utils';
import '../../style.scss';
import './QRCodes.scss';
import getCurrency from '../../config/getCurrency';
import { handleOnPaymentCompleted, handleOnPaymentFailed } from '../../handlers';

const handleQRCodePayment = async (state, component, actions, countryCode) => {
    const currency = getCurrency(countryCode);
    const config = { countryCode, amount: { currency, value: 25940 } };

    component.setStatus('loading');

    try {
        const { action, order, resultCode, donationToken } = await makePayment(state.data, config);

        if (!resultCode) actions.reject();

        actions.resolve({
            resultCode,
            action,
            order,
            donationToken
        });
    } catch (error) {
        console.error('## onSubmit - critical error', error);
        actions.reject();
    }
};

(async () => {
    window.checkout = await AdyenCheckout({
        clientKey: process.env.__CLIENT_KEY__,
        countryCode,
        locale: shopperLocale,
        environment: process.env.__CLIENT_ENV__,
        ...environmentUrlsOverride,
        risk: { node: 'body', onError: console.error },
        onPaymentCompleted: handleOnPaymentCompleted,
        onPaymentFailed: handleOnPaymentFailed
    });

    // WechatPay QR
    new WeChat(checkout, {
        type: 'wechatpayQR',
        onSubmit: (state, component, actions) => {
            handleQRCodePayment(state, component, actions, 'CN');
        }
    }).mount('#wechatpayqr-container');

    // BCMC Mobile
    new BcmcMobile(checkout, {
        onSubmit: (state, component, actions) => {
            handleQRCodePayment(state, component, actions, 'BE');
        }
    }).mount('#bcmcqr-container');

    new Swish(checkout, {
        onSubmit: (state, component, actions) => {
            handleQRCodePayment(state, component, actions, 'SE');
        }
    }).mount('#swish-container');

    new PromptPay(checkout, {
        onSubmit: (state, component, actions) => {
            handleQRCodePayment(state, component, actions, 'TH');
        }
    }).mount('#promptpay-container');

    new PayNow(checkout, {
        onSubmit: (state, component, actions) => {
            handleQRCodePayment(state, component, actions, 'SG');
        }
    }).mount('#paynow-container');

    new DuitNow(checkout, {
        onSubmit: (state, component, actions) => {
            handleQRCodePayment(state, component, actions, 'MY');
        }
    }).mount('#duitnow-container');
})();
