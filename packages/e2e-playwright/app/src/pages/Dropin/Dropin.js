import { AdyenCheckout, Dropin } from '@adyen/adyen-web/auto';
import '@adyen/adyen-web/styles/adyen.css';
import { getPaymentMethods } from '../../services';
import { amount, shopperLocale, countryCode } from '../../services/commonConfig';
import { handleSubmit, handleAdditionalDetails, handleError } from '../../handlers';
import '../../style.scss';

const initCheckout = async () => {
    const paymentMethodsResponse = await getPaymentMethods({ amount, shopperLocale });

    console.log(window.mainConfiguration);

    window.checkout = await AdyenCheckout({
        amount,
        countryCode,
        clientKey: process.env.__CLIENT_KEY__,
        paymentMethodsResponse,
        locale: shopperLocale,
        environment: 'test',
        onSubmit: handleSubmit,
        onAdditionalDetails: handleAdditionalDetails,
        onError: handleError,
        ...window.mainConfiguration
    });

    window.dropin = new Dropin({ core: window.checkout, ...window.dropinConfig }).mount('#dropin-container');
};

initCheckout();
