import { AdyenCheckout, Dotpay } from '@adyen/adyen-web';
import '@adyen/adyen-web/styles/adyen.css';
import { handleSubmit, handleAdditionalDetails, handleError, handlePaymentCompleted } from '../../handlers';
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
                            id: '73',
                            name: 'BLIK'
                        },

                        {
                            id: '81',
                            name: 'Idea Cloud'
                        },

                        {
                            id: '68',
                            name: 'mRaty'
                        },
                        {
                            id: '1',
                            name: 'mTransfer'
                        },
                        {
                            id: '91',
                            name: 'Nest Bank'
                        }
                    ],
                    name: 'Local Polish Payment Methods',
                    type: 'dotpay'
                }
            ]
        },
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
        onSubmit: handleSubmit,
        onAdditionalDetails: handleAdditionalDetails,
        onPaymentCompleted: handlePaymentCompleted,
        onError: handleError
    });

    window.dotpay = new Dotpay(checkout, { highlightedIssuers: ['73', '81', '68'] }).mount('.issuer-field');
};

initCheckout();
