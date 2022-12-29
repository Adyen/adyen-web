import AdyenCheckout from '@adyen/adyen-web';
import '@adyen/adyen-web/dist/es/adyen.css';
// import { getPaymentMethods } from '../../services';
import { handleSubmit, handleAdditionalDetails, handleError, handleChange } from '../../utils/handlers';
import { amount, shopperLocale } from '../../config/commonConfig';

export const createCard = ({ checkout, ...props }) => {
    const card = checkout.create('card', { brands: ['mc', 'visa', 'amex', 'bcmc', 'maestro'] });

    // window.checkout = await AdyenCheckout({
    //     amount,
    //     clientKey: process.env.__CLIENT_KEY__,
    //     paymentMethodsResponse,
    //     locale: shopperLocale,
    //     environment: process.env.__CLIENT_ENV__,
    //     showPayButton: true,
    //     onSubmit: handleSubmit,
    //     onAdditionalDetails: handleAdditionalDetails,
    //     onError: handleError,
    //     onChange: handleChange,
    //     paymentMethodsConfiguration: {
    //         card: {
    //             hasHolderName: true
    //         }
    //     }
    // });
    //
    // const card = checkout
    //     .create('card', {
    //         brands: ['mc', 'visa', 'amex', 'bcmc', 'maestro']
    //     })
    //     .mount('div');
    //
    const article = document.createElement('div');
    article.innerText = 'hi';

    return article;
};
