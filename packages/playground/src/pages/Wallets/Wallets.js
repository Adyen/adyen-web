import AdyenCheckout from '@adyen/adyen-web';
import '@adyen/adyen-web/dist/adyen.css';
import { getPaymentMethods, makePayment } from '../../services';
import { handleSubmit, handleAdditionalDetails } from '../../handlers';
import { checkPaymentResult } from '../../utils';
import { shopperLocale } from '../../config/commonConfig';
import '../../../config/polyfills';
import '../../style.scss';

function init() {
    getPaymentMethods({ amount: window.amount, shopperLocale }).then(async paymentMethodsResponse => {
        window.checkout = await AdyenCheckout({
            amount: window.amount,
            clientKey: process.env.__CLIENT_KEY__,
            paymentMethodsResponse,
            locale: shopperLocale,
            environment: process.env.__CLIENT_ENV__,
            onSubmit: handleSubmit,
            onAdditionalDetails: handleAdditionalDetails,
            onError: console.error,
            showPayButton: true
        });

        // PAYPAL
        console.log('Paypal: loading first button');
        window.paypalButtons = checkout
            .create('paypal', {
                intent: 'capture',
                // Events
                onError: (error, component) => {
                    component.setStatus('ready');
                    console.log('paypal onError', error);
                },

                onCancel: (data, component) => {
                    component.setStatus('ready');
                    console.log('paypal onCancel', data);
                }
            })
            .mount('.paypal-field');

        console.log('Paypal: loading second button');
        window.paypalButtons2 = checkout
            .create('paypal', {
                style: { color: 'blue' },
                // Events
                onError: (error, component) => {
                    component.setStatus('ready');
                    console.log('paypal onError', error);
                }
            })
            .mount('.paypal-field-2');

        setTimeout(() => {
            console.log('Paypal: loading third button asynchronously');
            window.paypalButtons3 = checkout
                .create('paypal', {
                    style: { color: 'black' },
                    // Events
                    onError: (error, component) => {
                        component.setStatus('ready');
                        console.log('paypal onError', error);
                    }
                })
                .mount('.paypal-field-3');
        }, 2000);
    });
}

// Unmount all buttons, then set currency to GBP and then mount again
window.reload = () => {
    window.paypalButtons.unmount();
    window.paypalButtons2.unmount();
    window.paypalButtons3.unmount();

    if (window.amount.currency === 'GBP') {
        window.amount = { currency: 'EUR', value: 25900 };
    } else {
        window.amount = { currency: 'GBP', value: 25900 };
    }

    init();
};

init();
