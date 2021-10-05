import AdyenCheckout from '@adyen/adyen-web';
import '@adyen/adyen-web/dist/adyen.css';
import { handleSubmit, handleAdditionalDetails, handleError } from '../../handlers';
import { amount, shopperLocale, countryCode } from '../../services/commonConfig';
import '../../style.scss';
import { getPaymentMethods } from '../../services';

const initCheckout = async () => {
    const paymentMethodsResponse = await getPaymentMethods({
        amount,
        shopperLocale
    });

    const checkout = new AdyenCheckout({
        amount,
        paymentMethodsResponse,
        clientKey: process.env.__CLIENT_KEY__,
        locale: shopperLocale,
        countryCode,
        environment: 'test',
        showPayButton: true,
        onSubmit: handleSubmit,
        onAdditionalDetails: handleAdditionalDetails,
        onError: handleError,
        paymentMethodsConfiguration: {
            ideal: {
                predefinedIssuers: [
                    { id: '1121', name: 'Test Issuer' },
                    { id: '1154', name: 'Test Issuer 5' },
                    { id: '1153', name: 'Test Issuer 4' }
                ]
            }
        }
        // ...window.mainConfiguration
    });

    window.ideal = checkout.create('ideal').mount('.ideal-field');
};

initCheckout();
