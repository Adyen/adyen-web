import AdyenCheckout from '@adyen/adyen-web';
import '@adyen/adyen-web/dist/es/adyen.css';
import { getPaymentMethods } from '../../services';
import { handleSubmit, handleAdditionalDetails, handleError, handleChange } from '../../handlers';
import { amount, shopperLocale } from '../../config/commonConfig';
import '../../../config/polyfills';
import '../../style.scss';
import { MockReactApp } from './MockReactApp';

const showComps = {
    clickToPay: true,
    storedCard: true,
    card: true,
    cardInReact: true,
    bcmcCard: true,
    avsCard: true,
    avsPartialCard: true,
    kcpCard: true
};

getPaymentMethods({ amount, shopperLocale }).then(async paymentMethodsResponse => {
    window.checkout = await AdyenCheckout({
        amount,
        clientKey: process.env.__CLIENT_KEY__,
        paymentMethodsResponse,
        locale: shopperLocale,
        environment: process.env.__CLIENT_ENV__,
        showPayButton: true,
        onSubmit: handleSubmit,
        onAdditionalDetails: handleAdditionalDetails,
        onError: handleError,
        onChange: handleChange,
        paymentMethodsConfiguration: {
            card: {
                hasHolderName: true
            }
        }
    });

    // Stored Card
    if (showComps.storedCard) {
        if (checkout.paymentMethodsResponse.storedPaymentMethods && checkout.paymentMethodsResponse.storedPaymentMethods.length > 0) {
            const storedCardData = checkout.paymentMethodsResponse.storedPaymentMethods[0];
            window.storedCard = checkout.create('card', storedCardData).mount('.storedcard-field');
        }
    }

    // Credit card with installments
    if (showComps.card) {
        window.card = checkout
            .create('card', {
                brands: ['mc', 'visa', 'amex', 'bcmc', 'maestro'],
                installmentOptions: {
                    mc: {
                        values: [1, 2, 3]
                    },
                    visa: {
                        values: [1, 2, 3, 4],
                        plans: ['regular', 'revolving']
                    }
                },
                showBrandsUnderCardNumber: true,
                showInstallmentAmounts: true,
                onError: obj => {
                    console.log('### Cards::onError:: obj=', obj);
                },
                onBinLookup: obj => {
                    console.log('### Cards::onBinLookup:: obj=', obj);
                }
            })
            .mount('.card-field');
    }

    // Card mounted in a React app
    if (showComps.cardInReact) {
        window.cardReact = checkout.create('card', {});
        MockReactApp(window, 'cardReact', document.querySelector('.react-card-field'), false);
    }

    // Bancontact card
    if (showComps.bcmcCard) {
        window.bancontact = checkout.create('bcmc').mount('.bancontact-field');
    }

    // Credit card with AVS
    if (showComps.avsCard) {
        window.cardAvs = checkout
            .create('card', {
                type: 'scheme',
                brands: ['mc', 'visa', 'amex', 'bcmc', 'maestro'],
                enableStoreDetails: true,

                // holderName config:
                hasHolderName: true,
                holderNameRequired: true,
                holderName: 'J. Smith',
                positionHolderNameOnTop: true,

                // billingAddress config:
                billingAddressRequired: true,
                billingAddressAllowedCountries: ['US', 'CA', 'GB'],
                // billingAddressRequiredFields: ['postalCode', 'country'],

                // data:
                data: {
                    holderName: 'J. Smith',
                    billingAddress: {
                        street: 'Infinite Loop',
                        postalCode: '95014',
                        city: 'Cupertino',
                        houseNumberOrName: '1',
                        country: 'US',
                        stateOrProvince: 'CA'
                    }
                },
                onError: objdobj => {
                    console.log('component level merchant defined error handler for Card objdobj=', objdobj);
                }
            })
            .mount('.card-avs-field');
    }

    if (showComps.avsPartialCard) {
        window.avsPartialCard = checkout
            .create('card', {
                type: 'scheme',
                brands: ['mc', 'visa', 'amex', 'bcmc', 'maestro'],
                // billingAddress config:
                billingAddressRequired: true,
                billingAddressMode: 'partial',
                onError: objdobj => {
                    console.log('component level merchant defined error handler for Card objdobj=', objdobj);
                }
            })
            .mount('.card-avs-partial-field');
    }

    // Credit card with KCP Authentication
    if (showComps.kcpCard) {
        window.kcpCard = checkout
            .create('card', {
                type: 'scheme',
                brands: ['mc', 'visa', 'amex', 'bcmc', 'maestro', 'korean_local_card'],
                // Set koreanAuthenticationRequired AND countryCode so KCP fields show at start
                // Just set koreanAuthenticationRequired if KCP fields should only show if korean_local_card entered
                configuration: {
                    koreanAuthenticationRequired: true
                },
                countryCode: 'KR'
            })
            .mount('.card-kcp-field');
    }

    if (showComps.clickToPay) {
        /**
         * Make sure that the initialization values are being set in the /paymentMethods response,
         * as part of the 'scheme' configuration object
         */
        window.ctpCard = checkout
            .create('card', {
                type: 'scheme',
                brands: ['mc', 'visa'],
                configuration: {
                    mcDpaId: '6d41d4d6-45b1-42c3-a5d0-a28c0e69d4b1_dpa2',
                    mcSrcClientId: '6d41d4d6-45b1-42c3-a5d0-a28c0e69d4b1'
                },
                clickToPayConfiguration: {
                    disableOtpAutoFocus: true,
                    shopperEmail: 'gui.ctp@adyen.com',
                    merchantDisplayName: 'Adyen Merchant Name '
                }
            })
            .mount('.card-ctp-field');
    }
});
