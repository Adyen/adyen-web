import AdyenCheckout from '@adyen/adyen-web';
import '@adyen/adyen-web/dist/es/adyen.css';
import { handleError, handlePaymentCompleted } from '../../handlers';
import { shopperLocale, countryCode } from '../../services/commonConfig';
import '../../style.scss';
import { createSession } from '../../services';

const initCheckout = async () => {
    const session = await createSession({
        amount: {
            value: 123,
            currency: 'EUR'
        },
        reference: 'ABC123',
        returnUrl: 'http://localhost:3024/result',
        countryCode
    });

    const checkout = await AdyenCheckout({
        analytics: {
            enabled: false
        },
        session,
        clientKey: process.env.__CLIENT_KEY__,
        locale: shopperLocale,
        _environmentUrls: {
            cdn: {
                translations: '/'
            }
        },
        countryCode,
        environment: 'test',
        showPayButton: true,
        onPaymentCompleted: handlePaymentCompleted,
        onError: handleError
        // ...window.mainConfiguration
    });

    window.ideal = checkout.create('redirect', { ...window.redirectConfig }).mount('.redirect-field');
};

initCheckout();
