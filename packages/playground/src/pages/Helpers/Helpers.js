import { AdyenCheckout, Donation, PersonalDetails, Address } from '@adyen/adyen-web';
import '@adyen/adyen-web/styles/adyen.css';
import '../../../config/polyfills';
import '../../style.scss';
import { getPaymentMethods } from '../../services';
import { amount, shopperLocale, countryCode, environmentUrlsOverride } from '../../config/commonConfig';
import { searchFunctionExample } from '../../utils';

getPaymentMethods({ amount, shopperLocale }).then(async paymentMethodsResponse => {
    window.checkout = await AdyenCheckout({
        amount, // Optional. Used to display the amount in the Pay Button.
        countryCode,
        clientKey: process.env.__CLIENT_KEY__,
        ...environmentUrlsOverride,
        paymentMethodsResponse,
        locale: shopperLocale,
        translations: {
            'en-US': {
                addressTown: 'Address + Town',
                pin: 'PIN'
            }
        },
        environment: 'test',
        onError: console.error,
        showPayButton: true
    });

    // Adyen New Giving
    window.new_donation_fixed = new Donation(window.checkout, {
        onDonate: (state, component) => {
            console.log({ state, component });
            setTimeout(() => component.setStatus('success'), 1000);
        },
        donation: { type: 'fixedAmounts', currency: 'EUR', values: [50, 199, 300, 500, 1000] },
        commercialTxAmount: 1000,
        termsAndConditionsUrl: 'https://www.adyen.com',
        bannerUrl: '/banner.png',
        logoUrl: '/logo.png',
        nonprofitDescription:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        nonprofitName: 'Test Charity',
        causeName: 'Earthquake Turkey & Syria',
        nonprofitUrl: 'https://example.org',
        onCancel(data) {
            console.log(data);
        }
    }).mount('.new-donation-fixed-amounts-field');

    window.new_donation_roundup = new Donation(window.checkout, {
        onDonate: (state, component) => {
            console.log({ state, component });
            setTimeout(() => component.setStatus('success'), 1000);
        },
        donation: { type: 'roundup', currency: 'EUR', maxRoundupAmount: 100 },
        commercialTxAmount: 1000,
        termsAndConditionsUrl: 'https://www.adyen.com',
        bannerUrl: '/banner.png',
        logoUrl: '/logo.png',
        nonprofitDescription: 'Lorem ipsum...',
        nonprofitName: 'Test Charity',
        causeName: 'Earthquake Turkey & Syria',
        nonprofitUrl: 'https://example.org',
        onCancel(data) {
            console.log(data);
        }
    }).mount('.new-donation-roundup-field');

    // Personal details
    window.personalDetails = new PersonalDetails(window.checkout, {
        onChange: console.log
    }).mount('.personalDetails-field');

    // Address
    window.address = new Address(window.checkout, {
        onAddressLookup: searchFunctionExample,
        onChange: console.log,
        validationRules: {
            postalCode: {
                validate: (value, context) => {
                    const selectedCountry = context.state?.data?.country;
                    const isOptional = selectedCountry === 'IN';
                    return isOptional || (value && value.length > 0);
                },
                modes: ['blur']
            },
            // Example of overwriting the default validation rule (which doesn't consider an empty field to be in error, unless the whole form is being validated)
            // with a new rule that will throw an error on a field if you click into it and then click out again leaving it empty
            default: {
                validate: value => value && value.length > 0,
                modes: ['blur']
            }
        },
        specifications: {
            IN: {
                hasDataset: false,
                optionalFields: ['postalCode'],
                labels: {
                    postalCode: 'pin',
                    street: 'addressTown'
                },
                schema: [
                    'country',
                    'street',
                    'houseNumberOrName',
                    [
                        ['city', 70],
                        ['postalCode', 30]
                    ]
                ]
            }
        }
    }).mount('.address-field');
});
