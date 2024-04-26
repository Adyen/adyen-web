import { AdyenCheckout, Dropin } from '@adyen/adyen-web/auto';
import '@adyen/adyen-web/styles/adyen.css';
import { createSession, getPaymentMethods } from '../../services';
import { amount, shopperLocale, countryCode } from '../../services/commonConfig';
import { handleError, handlePaymentCompleted } from '../../handlers';
import '../../style.scss';

const initCheckout = async () => {
    const session = await createSession({
        amount,
        shopperLocale,
        countryCode,
        reference: 'mock-playwright',
        returnUrl: 'http://localhost:3024/dropinsessions',
        ...window.sessionConfig
    });

    window.checkout = await AdyenCheckout({
        clientKey: process.env.__CLIENT_KEY__,
        session,
        environment: 'test',
        _environmentUrls: {
            cdn: {
                translations: '/'
            }
        },
        onPaymentCompleted: handlePaymentCompleted,
        onError: handleError,
        ...window.mainConfiguration
    });

    window.dropin = new Dropin(window.checkout, { ...window.dropinConfig }).mount('#dropin-container');
};

initCheckout();
