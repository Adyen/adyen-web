import AdyenCheckout from '@adyen/adyen-web/dist/es';
import '@adyen/adyen-web/dist/adyen.css';
import { createSession } from '../../services';
import { amount, shopperLocale, countryCode } from '../../config/commonConfig';
import { getSearchParameters } from '../../utils';
import '../../../config/polyfills';
import '../../style.scss';

const initCheckout = async () => {
    const session = await createSession({
        amount,
        reference: 'ABC123',
        returnUrl: 'http://localhost:3020/',
        countryCode
    });

    window.checkout = await AdyenCheckout({
        session,
        countryCode,
        clientKey: process.env.__CLIENT_KEY__,
        locale: shopperLocale,
        environment: 'http://localhost:8080/checkoutshopper/',
        installmentOptions: {
            mc: {
                values: [1, 2, 3, 4]
            }
        },
        onPaymentCompleted: (result, component) => {
            console.log('onPaymentCompleted', result);
            switch (result.status) {
                case 'authorised':
                    component.setStatus('success');
                    break;
                default:
                    component.setStatus('error');
            }
        },
        onError: obj => {
            console.log('checkout level merchant defined onError handler obj=', obj);
        },
        paymentMethodsConfiguration: {
            card: {
                enableStoreDetails: false,
                hasHolderName: true,
                holderNameRequired: true,
                //                challengeWindowSize: '01',
                //                configuration: {
                //                    koreanAuthenticationRequired: true
                //                }
                // WILL NOT FIRE, but should, if not defined at Dropin.pmConfig level
                onConfigSuccess: obj => {
                    console.log('CHECKOUT-pmConfig level merchant defined onConfigSuccess handler obj', obj);
                },
                // WILL NOT FIRE, but should, if not defined at Dropin.pmConfig level
                onBrand: obj => {
                    console.log('CHECKOUT-pmConfig level merchant defined onBrand handler obj=', obj);
                }
                //                onError: obj => {
                //                    console.log('CHECKOUT-pmConfig level merchant defined onError handler obj=', obj);
                //                }
            },
            boletobancario_santander: {
                data: {
                    socialSecurityNumber: '56861752509',
                    billingAddress: {
                        street: 'Roque Petroni Jr',
                        postalCode: '59000060',
                        city: 'São Paulo',
                        houseNumberOrName: '999',
                        country: 'BR',
                        stateOrProvince: 'SP'
                    }
                }
            },
            applepay: {
                configuration: {
                    merchantName: 'Adyen Test merchant',
                    merchantId: '000000000200001'
                }
            },
            paywithgoogle: {
                countryCode: 'NL',
                onAuthorized: console.info
            },
            paypal: {
                onError: (error, component) => {
                    component.setStatus('ready');
                    console.log('paypal onError', error);
                },
                onCancel: (data, component) => {
                    component.setStatus('ready');
                    console.log('paypal onCancel', data);
                }
            },
            directdebit_GB: {
                data: {
                    holderName: 'Philip Dog',
                    bankAccountNumber: '12345678',
                    bankLocationId: '123456',
                    shopperEmail: 'phil@ddog.co.uk'
                }
            }
        }
    });

    window.dropin = checkout.create('dropin').mount('#dropin-container');
};

async function handleRedirectResult(redirectResult, sessionId) {
    window.checkout = await AdyenCheckout({
        sessionId,
        clientKey: process.env.__CLIENT_KEY__,
        environment: 'http://localhost:8080/checkoutshopper/',
        onPaymentCompleted: result => {
            console.log('onPaymentCompleted', result);
            alert(result.status);
        },
        onError: obj => {
            console.log('checkout level merchant defined onError handler obj=', obj);
        }
    });

    checkout.submitDetails({ redirectResult });
}

(async () => {
    const { redirectResult, sessionId } = getSearchParameters(window.location.search);

    if (!redirectResult) {
        await initCheckout();
    } else {
        await handleRedirectResult(redirectResult, sessionId);
    }
})();
