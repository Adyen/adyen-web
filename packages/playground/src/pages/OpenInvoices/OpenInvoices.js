import { AdyenCheckout, RatePay, Riverty, RatePayDirectDebit, AfterPay, AfterPayB2B, FacilPay3x, Affirm, Atome, en_US } from '@adyen/adyen-web';
import '@adyen/adyen-web/styles/adyen.css';
import { getPaymentMethods } from '../../services';
import { handleChange, handleOnPaymentCompleted, handleOnPaymentFailed, handleSubmit } from '../../handlers';
import { amount, shopperLocale, countryCode, environmentUrlsOverride } from '../../config/commonConfig';
import '../../../config/polyfills';
import '../../style.scss';

window.paymentData = {};

const showComps = {
    ratepay: true,
    ratepaydd: true,
    afterpay: true,
    afterpayb2b: true,
    facilypay_3x: true,
    affirm: true,
    atome: true,
    riverty: true
};

getPaymentMethods({ amount, shopperLocale }).then(async paymentMethodsData => {
    window.core = await AdyenCheckout({
        clientKey: process.env.__CLIENT_KEY__,
        countryCode,
        locale: shopperLocale,
        paymentMethodsResponse: paymentMethodsData,
        environment: process.env.__CLIENT_ENV__,
        // onChange: handleChange,
        ...environmentUrlsOverride,
        onSubmit: handleSubmit,
        onPaymentCompleted: handleOnPaymentCompleted,
        onPaymentFailed: handleOnPaymentFailed,
        onError: console.error,
        showPayButton: true,
        amount // Optional. Used to display the amount in the Pay Button.
    });

    // RIVERTY
    if (showComps.riverty) {
        window.riverty = new Riverty(window.core, {
            countryCode: 'DE', // 'DE' / 'AT' / 'CH'
            visibility: {
                personalDetails: 'editable', // editable [default] / readOnly / hidden
                billingAddress: 'editable',
                deliveryAddress: 'editable'
            }
        }).mount('.riverty-field');
    }

    // RATEPAY
    if (showComps.ratepay) {
        window.ratepay = new RatePay(window.core, {
            countryCode: 'DE', // 'DE' / 'AT' / 'CH'
            visibility: {
                personalDetails: 'editable', // editable [default] / readOnly / hidden
                billingAddress: 'editable',
                deliveryAddress: 'editable'
            }
        }).mount('.ratepay-field');
    }

    // RATEPAY
    if (showComps.ratepaydd) {
        window.ratepaydd = new RatePayDirectDebit(window.core, {
            //countryCode: 'DE', // 'DE' / 'AT' / 'CH'
            visibility: {
                personalDetails: 'editable', // editable [default] / readOnly / hidden
                billingAddress: 'editable',
                deliveryAddress: 'editable'
            }
        }).mount('.ratepay-direct-field');
    }

    // AFTERPAY
    if (showComps.afterpay) {
        window.afterpay = new AfterPay(window.core, {
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
        }).mount('.afterpay-field');
    }

    // AFTERPAY B2B
    if (showComps.afterpayb2b) {
        window.afterpayb2b = new AfterPayB2B(window.core, {
            countryCode: 'NL', // 'NL' / 'BE'
            visibility: {
                companyDetails: 'editable' // editable [default] / readOnly / hidden
            }
        }).mount('.afterpayb2b-field');
    }

    // FACILYPAY_3x
    if (showComps.facilypay_3x) {
        window.facilypay_3x = new FacilPay3x(window.core, {
            countryCode: 'ES', // 'ES' / 'FR'
            visibility: {
                personalDetails: 'editable', // editable [default] / readOnly / hidden
                billingAddress: 'editable',
                deliveryAddress: 'editable'
            }
        }).mount('.facilypay_3x-field');
    }

    // AFFIRM
    if (showComps.affirm) {
        window.affirm = new Affirm(window.core, {
            countryCode: 'US', // 'US' / 'CA'
            visibility: {
                personalDetails: 'hidden', // editable [default] / readOnly / hidden
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
        }).mount('.affirm-field');
    }

    // ATOME
    if (showComps.atome) {
        window.atome = new Atome(window.core, {
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
        }).mount('.atome-field');
    }
});
