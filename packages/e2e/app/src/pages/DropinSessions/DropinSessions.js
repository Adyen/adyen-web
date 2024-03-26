import { AdyenCheckout, Dropin, Card, Giftcard } from '@adyen/adyen-web';
import '@adyen/adyen-web/styles/adyen.css';
import { createSession } from '../../services';
import { amount, shopperLocale, countryCode, returnUrl, shopperReference } from '../../services/commonConfig';
import '../../style.scss';

const initCheckout = async () => {
    const session = await createSession({
        amount,
        reference: 'ABC123',
        returnUrl,
        shopperLocale,
        shopperReference,
        countryCode
    });

    const checkout = await AdyenCheckout({
        environment: 'test',
        clientKey: process.env.__CLIENT_KEY__,
        session,
        translationEnvironment: 'local',

        onPaymentCompleted: (result, component) => {
            console.info(result, component);
        },
        onError: (error, component) => {
            console.error(error.message, component);
        },
        ...window.mainConfiguration
    });

    window.dropin = new Dropin(checkout, { paymentMethodComponents: [Card, Giftcard], ...window.dropinConfig }).mount('#dropin-sessions-container');
};

initCheckout();
