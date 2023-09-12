import { AdyenCheckout, RatePay, RatePayDirectDebit, AfterPay, AfterPayB2B, FacilPay3x, Affirm, Atome, en_US } from '@adyen/adyen-web';
import '@adyen/adyen-web/styles/adyen.css';
import { getPaymentMethods } from '../../services';
import { handleChange, handleSubmit } from '../../handlers';
import { amount, shopperLocale } from '../../config/commonConfig';
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
    atome: true
};

getPaymentMethods({ amount, shopperLocale }).then(async paymentMethodsData => {
    window.core = await AdyenCheckout({
        clientKey: process.env.__CLIENT_KEY__,
        locale: en_US,
        paymentMethodsResponse: paymentMethodsData,
        environment: process.env.__CLIENT_ENV__,
        onChange: handleChange,
        onSubmit: handleSubmit,
        onError: console.error,
        showPayButton: true,
        amount // Optional. Used to display the amount in the Pay Button.
    });

    // RATEPAY
    if (showComps.ratepay) {
        window.ratepay = new RatePay({
            core: window.core,
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
        window.ratepaydd = new RatePayDirectDebit({
            core: window.core,
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
        window.afterpay = new AfterPay({
            core: window.core,
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
        window.afterpayb2b = new AfterPayB2B({
            core: window.core,
            countryCode: 'NL', // 'NL' / 'BE'
            visibility: {
                companyDetails: 'editable' // editable [default] / readOnly / hidden
            }
        }).mount('.afterpayb2b-field');
    }

    // FACILYPAY_3x
    if (showComps.facilypay_3x) {
        window.facilypay_3x = new FacilPay3x({
            core: window.core,
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
        window.affirm = new Affirm({
            core: window.core,
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
        }).mount('.affirm-field');
    }

    // ATOME
    if (showComps.atome) {
        window.atome = new Atome({
            core: window.core,
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
