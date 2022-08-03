import AdyenCheckout from '@adyen/adyen-web';
import '@adyen/adyen-web/dist/es/adyen.css';
import { getPaymentMethods } from '../../services';
import { handleSubmit, handleAdditionalDetails, handleError, handleChange } from '../../handlers';
import { amount, shopperLocale } from '../../config/commonConfig';
import '../../../config/polyfills';
import '../../style.scss';

const showComps = {
    storedCard: false,
    card: false,
    bcmcCard: false,
    avsCard: false,
    avsPartialCard: false,
    kcpCard: false,
    ctp: true
};

getPaymentMethods({ amount, shopperLocale }).then(async paymentMethodsResponse => {
    window.checkout = await AdyenCheckout({
        amount,
        clientKey: process.env.__CLIENT_KEY__,
        paymentMethodsResponse,
        locale: shopperLocale,
        environment: process.env.__CLIENT_ENV__,
        shopperEmail: 'guilherme.ribeiro-ctp1@adyen.com',
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
                configuration: {
                    koreanAuthenticationRequired: true
                },
                countryCode: 'KR'
            })
            .mount('.card-kcp-field');
    }

    if (showComps.ctp) {
        window.ctpCard = checkout
            .create('card', {
                type: 'scheme',
                brands: ['mc', 'visa', 'amex'],
                // 'configuration' is returned from the Backend. These values are here so we can 'test' without the Backend configuration
                configuration: {
                    visaSrciDpaId: '8e6e347c-254e-863f-0e6a-196bf2d9df02',
                    visaSrcInitiatorId: 'B9SECVKIQX2SOBQ6J9X721dVBBKHhJJl1nxxVbemHGn5oB6S8',
                    mcDpaId: '6d41d4d6-45b1-42c3-a5d0-a28c0e69d4b1_dpa2',
                    mcSrcClientId: '6d41d4d6-45b1-42c3-a5d0-a28c0e69d4b1'
                },
                clickToPayConfiguration: {
                    shopperIdentityValue: 'guilherme.ribeiro-ctp1@adyen.com'
                }
            })
            .mount('.card-ctp-field');
    }
});
