import AdyenCheckout from '@adyen/adyen-web';
import '@adyen/adyen-web/dist/es/adyen.css';
import { handleSubmit, handleAdditionalDetails, handleError } from '../../handlers';
import { amount, shopperLocale, countryCode } from '../../services/commonConfig';
import '../../style.scss';

const initCheckout = async () => {
    const checkout = await AdyenCheckout({
        analytics: {
            enabled: false
        },
        amount,
        // These tests are very conditional on the expected issuers being listed and in the existing order, so we mock the pmResponse
        paymentMethodsResponse: {
            paymentMethods: [
                {
                    issuers: [
                        {
                            id: '231',
                            name: 'POP Pankki'
                        },
                        {
                            id: '232',
                            name: 'Aktia'
                        },
                        {
                            id: '1656',
                            name: 'AGBA'
                        },
                        {
                            id: '552',
                            name: 'Raiffeisen'
                        },
                        {
                            id: '751',
                            name: 'SEB'
                        }
                    ],
                    name: 'Bank Payment',
                    type: 'entercash'
                }
            ]
        },
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

    window.entercash = checkout.create('entercash', { highlightedIssuers: ['231', '551', '232'] }).mount('.issuer-field');
};

initCheckout();
