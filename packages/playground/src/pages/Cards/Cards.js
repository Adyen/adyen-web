import { AdyenCheckout, Card, Bancontact, nl_NL } from '@adyen/adyen-web';
import '@adyen/adyen-web/styles/adyen.css';

import { getPaymentMethods } from '../../services';
import { handleSubmit, handleAdditionalDetails, handleError } from '../../handlers';
import { amount, shopperLocale } from '../../config/commonConfig';
import '../../../config/polyfills';
import '../../style.scss';
import { MockReactApp } from './MockReactApp';
import getTranslationFile from '../../config/getTranslation';
import { searchFunctionExample } from '../../utils';

const onlyShowCard = false;

const showComps = {
    clickToPay: true,
    storedCard: true,
    card: true,
    cardWithInstallments: true,
    cardInReact: true,
    bcmcCard: true,
    avsCard: true,
    avsPartialCard: true,
    addressLookup: true,
    kcpCard: true
};

const disclaimerMessage = {
    message: 'By continuing you accept the %{linkText} of MyStore',
    linkText: 'terms and conditions',
    link: 'https://www.adyen.com'
};

getPaymentMethods({ amount, shopperLocale }).then(async paymentMethodsResponse => {
    window.checkout = await AdyenCheckout({
        amount,
        resourceEnvironment: 'https://checkoutshopper-test.adyen.com/checkoutshopper/',
        clientKey: process.env.__CLIENT_KEY__,
        paymentMethodsResponse,
        locale: shopperLocale,
        translationFile: getTranslationFile(shopperLocale),
        // translationFile: nl_NL
        environment: process.env.__CLIENT_ENV__,
        showPayButton: true,
        onSubmit: handleSubmit,
        onAdditionalDetails: handleAdditionalDetails,
        onError: handleError,
        risk: {
            enabled: false
        },
        onPaymentCompleted(result, element) {
            console.log('onPaymentCompleted', result, element);
        },
        onPaymentFailed(result, element) {
            console.log('onPaymentFailed', result, element);
        }
    });

    // Stored Card
    if (!onlyShowCard && showComps.storedCard) {
        if (checkout.paymentMethodsResponse.storedPaymentMethods && checkout.paymentMethodsResponse.storedPaymentMethods.length > 0) {
            // We are only interested in card based storedPaymentMethods
            let storedCardData;
            for (let i = 0; i < checkout.paymentMethodsResponse.storedPaymentMethods.length; i++) {
                if (checkout.paymentMethodsResponse.storedPaymentMethods[i].brand) {
                    storedCardData = checkout.paymentMethodsResponse.storedPaymentMethods[i];
                    break;
                }
            }

            window.storedCard = new Card(checkout, {
                ...storedCardData,
                disclaimerMessage
                // maskSecurityCode: true
                // hideCVC: true
            }).mount('.storedcard-field');

            // A "single branded" card
            // window.card = new Card(checkout, {
            //     brands: ['visa']
            // }).mount('.storedcard-field');
        }
    }

    if (onlyShowCard || showComps.card) {
        window.card = new Card(checkout, {
            challengeWindowSize: '01',
            _disableClickToPay: true,
            // hasHolderName: true,
            // holderNameRequired: true,
            // maskSecurityCode: true,
            // enableStoreDetails: true
            onBinLookup: obj => {
                console.log('### Cards::onBinLookup:: obj=', obj);
            }
        }).mount('.card-field');
    }

    // Credit card with installments
    if (!onlyShowCard && showComps.cardWithInstallments) {
        window.cardWithInstallments = new Card(checkout, {
            _disableClickToPay: true,
            brands: ['mc', 'visa', 'amex', 'bcmc', 'maestro'],
            installmentOptions: {
                mc: {
                    values: [1, 2],
                    preselectedValue: 2
                },
                visa: {
                    values: [1, 2, 3, 4],
                    plans: ['regular', 'revolving'],
                    preselectedValue: 4
                }
            },
            disclaimerMessage,
            showBrandsUnderCardNumber: true,
            showInstallmentAmounts: true,
            onError: obj => {
                console.log('### Cards::onError:: obj=', obj);
            },
            onBinLookup: obj => {
                console.log('### Cards::onBinLookup:: obj=', obj);
            }
        }).mount('.card-field-installments');
    }

    //
    // Card mounted in a React app
    if (!onlyShowCard && showComps.cardInReact) {
        window.cardReact = new Card(checkout);
        MockReactApp(window, 'cardReact', document.querySelector('.react-card-field'), false);
    }

    // Bancontact card
    if (!onlyShowCard && showComps.bcmcCard) {
        window.bancontact = new Bancontact(checkout).mount('.bancontact-field');
    }

    // Credit card with AVS
    if (!onlyShowCard && showComps.avsCard) {
        window.cardAvs = new Card(checkout, {
            // type: 'scheme',
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
        }).mount('.card-avs-field');
    }

    if (!onlyShowCard && showComps.addressLookup) {
        window.addressLookupCard = new Card(checkout, {
            brands: ['mc', 'visa', 'amex', 'bcmc', 'maestro'],
            billingAddressRequired: true,
            onAddressLookup: searchFunctionExample
        }).mount('.card-address-lookup-field');
    }

    if (!onlyShowCard && showComps.avsPartialCard) {
        window.avsPartialCard = new Card(checkout, {
            // type: 'scheme',
            brands: ['mc', 'visa', 'amex', 'bcmc', 'maestro'],
            // billingAddress config:
            billingAddressRequired: true,
            billingAddressMode: 'partial',
            onError: objdobj => {
                console.log('component level merchant defined error handler for Card objdobj=', objdobj);
            }
        }).mount('.card-avs-partial-field');
    }

    // Credit card with KCP Authentication
    if (!onlyShowCard && showComps.kcpCard) {
        window.kcpCard = new Card(checkout, {
            // type: 'scheme',
            brands: ['mc', 'visa', 'amex', 'bcmc', 'maestro', 'korean_local_card'],
            // Set koreanAuthenticationRequired AND countryCode so KCP fields show at start
            // Just set koreanAuthenticationRequired if KCP fields should only show if korean_local_card entered
            configuration: {
                koreanAuthenticationRequired: true
            },
            countryCode: 'KR'
        }).mount('.card-kcp-field');
    }

    if (!onlyShowCard && showComps.clickToPay) {
        /**
         * Make sure that the initialization values are being set in the /paymentMethods response,
         * as part of the 'scheme' configuration object
         */
        window.ctpCard = new Card(checkout, {
            type: 'scheme',
            brands: ['mc', 'visa'],
            configuration: {
                visaSrciDpaId: '8e6e347c-254e-863f-0e6a-196bf2d9df02',
                visaSrcInitiatorId: 'B9SECVKIQX2SOBQ6J9X721dVBBKHhJJl1nxxVbemHGn5oB6S8',
                mcDpaId: '6d41d4d6-45b1-42c3-a5d0-a28c0e69d4b1_dpa2',
                mcSrcClientId: '6d41d4d6-45b1-42c3-a5d0-a28c0e69d4b1'
            },
            clickToPayConfiguration: {
                shopperEmail: 'shopper@example.com',
                merchantDisplayName: 'Adyen Merchant Name',
                onReady: () => {
                    console.log('Component is ready to be used');
                },
                onTimeout: error => {
                    console.log(error);
                }
            }
        }).mount('.card-ctp-field');
    }
});
