import AdyenCheckout from '../../../src';
import { getPaymentMethods, getOriginKey } from '../../services';
import { handleSubmit, handleAdditionalDetails, handleError } from '../../handlers';
import { amount, shopperLocale } from '../../config/commonConfig';
import '../../../config/polyfills';
import '../../style.scss';

getOriginKey()
    .then(originKey => {
        window.originKey = originKey;
    })
    .then(() => getPaymentMethods({ amount, shopperLocale }))
    .then(paymentMethodsResponse => {
        window.checkout = new AdyenCheckout({
            amount, // Optional. Used to display the amount in the Pay Button.
            originKey,
            clientKey: process.env.__CLIENT_KEY__,
            paymentMethodsResponse,
            locale: shopperLocale,
            environment: 'test',
            showPayButton: true,
            onSubmit: handleSubmit,
            onAdditionalDetails: handleAdditionalDetails,
            onError: handleError,
            risk: {
                enabled: true, // Means that "riskdata" will then show up in the data object sent to the onChange event. Also accessible via
                // checkout.modules.risk.data
                //                node: '.merchant-checkout__form', // Element that DF iframe is briefly added to (defaults to body)
                //                onComplete: obj => {},
                onError: console.error
            }
            //            analytics: {
            //                conversion: true,
            //                telemetry: true
            //            }
        });

        // Stored Card
        if (checkout.paymentMethodsResponse.storedPaymentMethods && checkout.paymentMethodsResponse.storedPaymentMethods.length > 0) {
            const storedCardData = checkout.paymentMethodsResponse.storedPaymentMethods[0];
            window.storedCard = checkout.create('card', storedCardData).mount('.storedcard-field');
        }

        // Credit card with installments
        window.card = checkout
            .create('card', {
                type: 'scheme',
                brands: ['mc', 'visa', 'amex', 'bcmc', 'maestro'],
                hasHolderName: false,
                // holderNameRequired: true,
                enableStoreDetails: false,
                installmentOptions: {
                    // card: {
                    //     values: [1, 2]
                    // },
                    mc: {
                        values: [1, 2, 3]
                    },
                    visa: {
                        values: [1, 2, 3, 4]
                    }
                }
            })
            .mount('.card-field');

        // Bancontact card
        window.bancontact = checkout
            .create('bcmc', {
                type: 'bcmc',
                hasHolderName: true,
                // holderNameRequired: true,
                enableStoreDetails: false
            })
            .mount('.bancontact-field');

        // Credit card with AVS
        window.cardAvs = checkout
            .create('card', {
                type: 'scheme',
                brands: ['mc', 'visa', 'amex', 'bcmc', 'maestro'],
                enableStoreDetails: true,

                // holderName config:
                hasHolderName: true,
                holderNameRequired: true,
                holderName: 'J. Smith',

                // billingAddress config:
                billingAddressRequired: true,
                billingAddressAllowedCountries: ['US', 'CA', 'BR', 'IT'],
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
                }
            })
            .mount('.card-avs-field');

        // Credit card with KCP Authentication
        window.kcpCard = checkout
            .create('card', {
                type: 'scheme',
                brands: ['mc', 'visa', 'amex', 'bcmc', 'maestro'],
                // USE either separate koreanAuthenticationRequired prop...
                koreanAuthenticationRequired: true,
                // ...OR, preferably, wrap it in a configuration object
                configuration: {
                    koreanAuthenticationRequired: true
                },
                countryCode: 'KR'
            })
            .mount('.card-kcp-field');
    });
