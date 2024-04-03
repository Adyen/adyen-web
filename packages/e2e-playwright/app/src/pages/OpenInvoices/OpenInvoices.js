import { AdyenCheckout, Riverty } from '@adyen/adyen-web';
import '@adyen/adyen-web/styles/adyen.css';
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
        _translationEnvironment: 'local',
        environment: 'test',
        onSubmit: handleSubmit,
        onAdditionalDetails: handleAdditionalDetails,
        onError: handleError,
        showPayButton: true,
        ...window.mainConfiguration
    });

    window.riverty = new Riverty(checkout, window.rivertyConfig).mount('#rivertyContainer');
};

initCheckout();
