import AdyenCheckout from '@adyen/adyen-web/dist/es/index.js';
import '@adyen/adyen-web/dist/es/adyen.css';
import { handleSubmit, handleAdditionalDetails, handleError } from '../../handlers';
import { amount, shopperLocale, countryCode } from '../../services/commonConfig';
import '../../style.scss';

const initCheckout = async () => {
    window.checkout = await AdyenCheckout({
        amount,
        clientKey: process.env.__CLIENT_KEY__,
        locale: shopperLocale,
        countryCode,
        environment: 'test',
        showPayButton: true,
        onSubmit: handleSubmit,
        onAdditionalDetails: handleAdditionalDetails,
        onError: handleError,
        ...window.mainConfiguration
    });

    // Address
    window.address = checkout.create('address').mount('.address-field');
    // {
    // onChange: console.log,
    // validationRules: {
    //     postalCode: {
    //         validate: (value, context) => {
    //             const selectedCountry = context.state?.data?.country;
    //             const isOptional = selectedCountry === 'IN';
    //             return isOptional || (value && value.length > 0);
    //         },
    //         modes: ['blur']
    //     },
    //     default: {
    //         validate: value => value && value.length > 0,
    //         modes: ['blur']
    //     }
    // },
    // specifications: {
    //     IN: {
    //         hasDataset: false,
    //         optionalFields: ['postalCode'],
    //         labels: {
    //             postalCode: 'pin',
    //             street: 'addressTown'
    //         },
    //         schema: [
    //             'country',
    //             'street',
    //             'houseNumberOrName',
    //             [
    //                 ['city', 70],
    //                 ['postalCode', 30]
    //             ]
    //         ]
    //     }
    //     }
    // })
    // .mount('.address-field');
};

initCheckout();
