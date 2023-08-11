import { AdyenCheckout, Donation, PersonalDetails, Address } from '@adyen/adyen-web';
import '@adyen/adyen-web/styles/adyen.css';
import '../../../config/polyfills';
import '../../style.scss';
import { getPaymentMethods } from '../../services';
import { amount, shopperLocale } from '../../config/commonConfig';
import { searchFunctionExample } from '../../utils';

getPaymentMethods({ amount, shopperLocale }).then(async paymentMethodsResponse => {
    AdyenCheckout.register(Donation, PersonalDetails, Address);

    window.checkout = await AdyenCheckout({
        amount, // Optional. Used to display the amount in the Pay Button.
        clientKey: process.env.__CLIENT_KEY__,
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

    // Adyen Giving
    window.donation = new Donation(checkout, {
        onDonate: (state, component) => {
            console.log({ state, component });
            setTimeout(() => component.setStatus('ready'), 1000);
        },
        url: 'https://example.org',
        amounts: {
            currency: 'EUR',
            values: [50, 199, 300]
        },
        disclaimerMessage: {
            message: 'By donating you agree to the %{linkText} ',
            linkText: 'terms and conditions',
            link: 'https://www.adyen.com'
        },
        backgroundUrl:
            'https://www.patagonia.com/static/on/demandware.static/-/Library-Sites-PatagoniaShared/default/dwb396273f/content-banners/100-planet-hero-desktop.jpg',
        description: 'Lorem ipsum...',
        logoUrl: 'https://i.ebayimg.com/images/g/aTwAAOSwfu9dfX4u/s-l300.jpg',
        name: 'Test Charity',
        onCancel(data) {
            console.log(data);
        }
    }).mount('.donation-field');

    // Personal details
    window.personalDetails = new PersonalDetails(checkout, {
        onChange: console.log
    }).mount('.personalDetails-field');

    // Address
    window.address = new Address(checkout, {
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
