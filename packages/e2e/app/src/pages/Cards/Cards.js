import AdyenCheckout from '@adyen/adyen-web';
import '@adyen/adyen-web/dist/adyen.css';
import { handleSubmit, handleAdditionalDetails, handleError } from '../../handlers';
import { amount, shopperLocale, countryCode } from '../../services/commonConfig';
import '../../style.scss';

const initCheckout = async () => {
    window.checkout = await AdyenCheckout({
        amount,
        clientKey: process.env.__CLIENT_KEY__,
        locale: shopperLocale,
        countryCode,
        environment: 'test',
        showPayButton: true,
        onSubmit: handleSubmit,
        onAdditionalDetails: handleAdditionalDetails,
        onError: handleError,
        ...window.mainConfiguration
    });

    // Credit card with installments
    window.card = checkout
        .create('card', {
            brands: ['mc', 'visa', 'amex', 'maestro', 'bcmc'],
            //            onChange: state => console.log(state),
            onChange: state => {
                // Needed now that, for v5, we enhance the securedFields state.errors object with a rootNode prop
                // - Testcafe doesn't like a ClientFunction retrieving an object with a DOM node in it!?
                if (!!Object.keys(state.errors).length) {
                    // Replace any rootNode values in the objects in state.errors with an empty string
                    const nuErrors = Object.entries(state.errors).reduce((acc, [fieldType, error]) => {
                        acc[fieldType] = error ? { ...error, rootNode: '' } : error;
                        return acc;
                    }, {});
                    window.mappedStateErrors = nuErrors;
                }
            },
            ...window.cardConfig
        })
        .mount('.card-field');
};

initCheckout();
