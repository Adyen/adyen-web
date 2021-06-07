import AdyenCheckout from '@adyen/adyen-web';
import '@adyen/adyen-web/dist/adyen.css';
import { createSession } from '../../services';
import { amount, shopperLocale, countryCode, returnUrl } from '../../config/commonConfig';
import '../../../config/polyfills';
import '../../style.scss';

const initCheckout = async () => {
    const session = await createSession({
        amount,
        reference: 'ABC123',
        returnUrl,
        countryCode
    });

    const checkout = await AdyenCheckout({
        environment: process.env.__CLIENT_ENV__,
        clientKey: process.env.__CLIENT_KEY__,
        session,

        countryCode, // @deprecated
        locale: shopperLocale, // @deprecated

        onPaymentCompleted: (result, component) => {
            switch (result.resultCode) {
                case 'Authorised':
                    component.setStatus('success');
                    break;
                case 'Received':
                    component.setStatus('success', { message: 'Processing your payment...' });
                    break;
                default:
                    component.setStatus('error');
            }
        },
        onError: (error, component) => {
            console.error(error.name, error.message, error.stack);
        }
    });

    const dropin = checkout.create('dropin').mount('#dropin-container');
    return [checkout, dropin];
};

initCheckout().then(([checkout, dropin]) => {
    window.checkout = checkout;
    window.dropin = dropin;
});
