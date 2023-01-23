import AdyenCheckout from '@adyen/adyen-web';
import '@adyen/adyen-web/dist/es/adyen.css';
import '../../../config/polyfills';
import '../../style.scss';
import { getPaymentMethods } from '../../services';
import { amount, shopperLocale } from '../../config/commonConfig';

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
        showPayButton: true,
        moveFocusOnSubmitErrors: true,
        srConfig: {
            node: '.personalDetails-field',
            showPanel: true
        }
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
