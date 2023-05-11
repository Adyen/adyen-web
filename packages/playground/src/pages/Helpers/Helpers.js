import AdyenCheckout from '@adyen/adyen-web';
import '@adyen/adyen-web/dist/es/adyen.css';
import '../../../config/polyfills';
import '../../style.scss';
import { getPaymentMethods } from '../../services';
import { amount, shopperLocale } from '../../config/commonConfig';

const MOCK_ADDRESS_ARRAY = [
    {
        id: 376,
        name: '56 Willow Road, B17 8JA, Birmingham',
        address: 'Willow Road',
        postalCode: 'B17 8JA',
        city: 'Birmingham',
        houseNumber: 56
    },
    {
        id: 992,
        name: '39 Tower Bridge Road, SE1 4TR, London',
        address: 'Tower Bridge Road',
        postalCode: 'SE1 4TR',
        city: 'London',
        houseNumber: 39
    },
    {
        id: 185,
        name: '15 Winchester Avenue, M20 6RD, Manchester',
        address: 'Winchester Avenue',
        postalCode: 'M20 6RD',
        city: 'Manchester',
        houseNumber: 15
    },
    {
        id: 823,
        name: '5 Victoria Road, LS6 1PF, Leeds',
        address: 'Victoria Road',
        postalCode: 'LS6 1PF',
        city: 'Leeds',
        houseNumber: 5
    },
    {
        id: 664,
        name: '2 Edinburgh Road, G64 2LY, Glasgow',
        address: 'Edinburgh Road',
        postalCode: 'G64 2LY',
        city: 'Glasgow',
        houseNumber: 2
    },
    {
        id: 927,
        name: '12 York Street, BS2 8QH, Bristol',
        address: 'York Street',
        postalCode: 'BS2 8QH',
        city: 'Bristol',
        houseNumber: 12
    },
    {
        id: 340,
        name: '31 Queens Road, L18 9PE, Liverpool',
        address: 'Queens Road',
        postalCode: 'L18 9PE',
        city: 'Liverpool',
        houseNumber: 31
    },
    {
        id: 581,
        name: '22 York Road, NE1 5DL, Newcastle',
        address: 'York Road',
        postalCode: 'NE1 5DL',
        city: 'Newcastle',
        houseNumber: 22
    },
    {
        id: 709,
        name: '8 Church Lane, NG7 1QJ, Nottingham',
        address: 'Church Lane',
        postalCode: 'NG7 1QJ',
        city: 'Nottingham',
        houseNumber: 8
    },
    {
        id: 117,
        name: '47 Oxford Street, CB1 1EP, Cambridge',
        address: 'Oxford Street',
        postalCode: 'CB1 1EP',
        city: 'Cambridge',
        houseNumber: 47
    }
];

getPaymentMethods({ amount, shopperLocale }).then(async paymentMethodsResponse => {
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
    window.donation = checkout
        .create('donation', {
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
            name: 'Test Charity'
        })
        .mount('.donation-field');

    // Personal details
    window.personalDetails = checkout
        .create('personal_details', {
            onChange: console.log
        })
        .mount('.personalDetails-field');

    // Address
    window.address = checkout
        .create('address', {
            onAddressLookup: async value => {
                await fetch('/mock/addressSearch');
                return MOCK_ADDRESS_ARRAY.filter(item => item.name.toLowerCase().includes(value.toLowerCase()));
            },
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
        })
        .mount('.address-field');
});
