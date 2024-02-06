import { AdyenCheckout, Ideal } from '@adyen/adyen-web';
import '@adyen/adyen-web/styles/adyen.css';
import { handleSubmit, handleAdditionalDetails, handleError, handlePaymentCompleted } from '../../handlers';
import { amount, shopperLocale, countryCode } from '../../services/commonConfig';
import '../../style.scss';
import { getPaymentMethods } from '../../services';

const initCheckout = async () => {
    const paymentMethodsResponse = await getPaymentMethods({
        amount,
        shopperLocale
    });

    const checkout = await AdyenCheckout({
        analytics: {
            enabled: false
        },
        amount,
        paymentMethodsResponse,
        clientKey: process.env.__CLIENT_KEY__,
        locale: shopperLocale,
        countryCode,
        environment: 'test',
        showPayButton: true,
        onSubmit: handleSubmit,
        onAdditionalDetails: handleAdditionalDetails,
        onPaymentCompleted: handlePaymentCompleted,
        onError: handleError
        // ...window.mainConfiguration
    });

    window.ideal = new Ideal(checkout, { highlightedIssuers: ['1121', '1154', '1153'] }).mount('.ideal-field');
};

initCheckout();
