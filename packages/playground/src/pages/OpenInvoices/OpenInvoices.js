import AdyenCheckout from '@adyen/adyen-web';
import '@adyen/adyen-web/dist/es/adyen.css';
import { getPaymentMethods } from '../../services';
import { handleChange, handleSubmit } from '../../handlers';
import { amount, shopperLocale } from '../../config/commonConfig';
import '../../../config/polyfills';
import '../../style.scss';

window.paymentData = {};

getPaymentMethods({ amount, shopperLocale }).then(async paymentMethodsData => {
    window.checkout = await AdyenCheckout({
        clientKey: process.env.__CLIENT_KEY__,
        locale: shopperLocale,
        paymentMethodsResponse: paymentMethodsData,
        environment: process.env.__CLIENT_ENV__,
        onChange: handleChange,
        onSubmit: handleSubmit,
        onError: console.error,
        showPayButton: true,
        amount, // Optional. Used to display the amount in the Pay Button.
        srConfig: { showPanel: true }, // default: { enabled: true, showPanel: true, node: 'body' }
        moveFocusOnSubmitErrors: false // default: true
    });

    // AFTERPAY
    window.afterpay = checkout
        .create('afterpay_default', {
            countryCode: 'NL', // 'NL' / 'BE'
            visibility: {
                personalDetails: 'editable', // editable [default] / readOnly / hidden
                billingAddress: 'readOnly',
                deliveryAddress: 'hidden'
            },
            data: {
                billingAddress: {
                    city: 'Gravenhage',
                    country: 'NL',
                    houseNumberOrName: '1',
                    postalCode: '2521VA',
                    street: 'Neherkade'
                }
            }
        })
        .mount('.afterpay-field');

    // AFTERPAY B2B
    window.afterpayb2b = checkout
        .create('afterpay_b2b', {
            countryCode: 'NL', // 'NL' / 'BE'
            visibility: {
                companyDetails: 'editable' // editable [default] / readOnly / hidden
            }
        })
        .mount('.afterpayb2b-field');

    // AFFIRM
    window.affirm = checkout
        .create('affirm', {
            countryCode: 'US', // 'US' / 'CA'
            visibility: {
                personalDetails: 'editable', // editable [default] / readOnly / hidden
                billingAddress: 'editable',
                deliveryAddress: 'editable'
            },
            data: {
                personalDetails: {
                    firstName: 'Jan',
                    lastName: 'Jansen',
                    shopperEmail: 'shopper@testemail.com',
                    telephoneNumber: '+17203977880'
                },
                billingAddress: {
                    city: 'Boulder',
                    country: 'US',
                    houseNumberOrName: '242',
                    postalCode: '80302',
                    stateOrProvince: 'CO',
                    street: 'Silver Cloud Lane'
                }
            }
        })
        .mount('.affirm-field');

    // FACILYPAY_3x
    window.facilypay_3x = checkout
        .create('facilypay_3x', {
            countryCode: 'ES', // 'ES' / 'FR'
            visibility: {
                personalDetails: 'editable', // editable [default] / readOnly / hidden
                billingAddress: 'editable',
                deliveryAddress: 'editable'
            }
        })
        .mount('.facilypay_3x-field');

    // RATEPAY
    window.ratepay = checkout
        .create('ratepay', {
            countryCode: 'DE', // 'DE' / 'AT' / 'CH'
            visibility: {
                personalDetails: 'editable', // editable [default] / readOnly / hidden
                billingAddress: 'editable',
                deliveryAddress: 'editable'
            }
        })
        .mount('.ratepay-field');

    // RATEPAY
    window.ratepaydd = checkout
        .create('ratepay_directdebit', {
            //countryCode: 'DE', // 'DE' / 'AT' / 'CH'
            visibility: {
                personalDetails: 'editable', // editable [default] / readOnly / hidden
                billingAddress: 'editable',
                deliveryAddress: 'editable'
            }
        })
        .mount('.ratepay-direct-field');

    // ATOME
    window.atome = checkout
        .create('atome', {
            countryCode: 'SG',
            data: {
                personalDetails: {
                    firstName: 'Robert',
                    lastName: 'Jahnsen',
                    telephoneNumber: '80002018'
                },
                billingAddress: {
                    postalCode: '111111',
                    street: 'Silver Cloud Lane'
                }
            }
        })
        .mount('.atome-field');
});
