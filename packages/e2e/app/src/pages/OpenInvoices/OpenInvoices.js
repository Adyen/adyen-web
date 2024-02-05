import { AdyenCheckout, AfterPay } from '@adyen/adyen-web';
import '@adyen/adyen-web/styles/adyen.css';
import { handleSubmit, handleAdditionalDetails, handleError } from '../../handlers';
import { amount, shopperLocale, countryCode } from '../../services/commonConfig';
import '../../style.scss';
import { getPaymentMethods } from '../../services';

const initCheckout = async () => {
    const paymentMethodsResponse = await getPaymentMethods({
        amount,
        shopperLocale
    });

    const checkout = await AdyenCheckout({
        amount,
        paymentMethodsResponse,
        clientKey: process.env.__CLIENT_KEY__,
        locale: shopperLocale,
        countryCode,
        environment: 'test',
        showPayButton: true,
        onSubmit: handleSubmit,
        onAdditionalDetails: handleAdditionalDetails,
        onError: handleError
        // ...window.mainConfiguration
    });

    window.afterpay = new AfterPay({core: checkout}).mount('.afterpay-field');
};

initCheckout();
