import AdyenCheckout from '@adyen/adyen-web';
import '@adyen/adyen-web/dist/es/adyen.css';
import { getPaymentMethods } from '../../services';
import { amount, shopperLocale, countryCode } from '../../services/commonConfig';
import { handleSubmit, handleAdditionalDetails, handleError } from '../../handlers';
import '../../style.scss';

const initCheckout = async () => {
    const paymentMethodsResponse = await getPaymentMethods({ amount, shopperLocale });

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

    window.dropin = checkout.create('dropin', window.dropinConfig).mount('#dropin-container');
};

initCheckout();
