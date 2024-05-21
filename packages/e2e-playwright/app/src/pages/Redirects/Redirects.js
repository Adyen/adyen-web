import AdyenCheckout from '@adyen/adyen-web';
import '@adyen/adyen-web/dist/es/adyen.css';
import { handleError, handlePaymentCompleted } from '../../handlers';
import { shopperLocale, countryCode } from '../../services/commonConfig';
import '../../style.scss';
// import { getPaymentMethods } from '../../services';
import { createSession } from '../../services';
// import { returnUrl } from '@adyen/adyen-web-playground/src/config/commonConfig';

const initCheckout = async () => {
    // const paymentMethodsResponse = await getPaymentMethods({
    //     amount,
    //     shopperLocale
    // });
    //
    // const onSubmit = (state, component, actions) => {
    //     state.data.returnUrl = 'http://localhost:3024/result';
    //     handleSubmit(state, component, actions);
    // };

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
        // amount,
        // paymentMethodsResponse,
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
        // onSubmit, //: handleSubmit,
        // onAdditionalDetails: handleAdditionalDetails,
        onPaymentCompleted: handlePaymentCompleted,
        onError: handleError
        // ...window.mainConfiguration
    });

    window.ideal = checkout.create('redirect', { ...window.redirectConfig }).mount('.redirect-field');
};

initCheckout();
