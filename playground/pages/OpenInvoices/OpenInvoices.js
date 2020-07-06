import AdyenCheckout from '~';
import { getPaymentMethods, makeDetailsCall } from '../../services';
import { handleChange, handleSubmit } from '../../events';
import { amount, countryCode, shopperLocale } from '../../config/commonConfig';
import '../../../config/polyfills';
import '../../style.scss';

window.paymentData = {};

getPaymentMethods({ amount, shopperLocale }).then(paymentMethodsData => {
    window.checkout = new AdyenCheckout({
        locale: shopperLocale,
        paymentMethodsResponse: paymentMethodsData,
        environment: 'test',
        onChange: handleChange,
        onSubmit: handleSubmit,
        onError: console.error,
        showPayButton: true,
        amount, // Optional. Used to display the amount in the Pay Button.
        onAdditionalDetails: (details, component) => {
            component.setStatus('loading');

            makeDetailsCall(details.data).then(response => {
                handleResponse(response, component);
                component.setStatus('ready');
            });
        }
        // risk: {
        //     node: '.merchant-checkout__form',
        //     onComplete: riskData => {
        //         console.log('handleOnRiskData riskData=', riskData);
        //     },
        //     onError: console.error,
        //     enabled: true
        // }
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
});
