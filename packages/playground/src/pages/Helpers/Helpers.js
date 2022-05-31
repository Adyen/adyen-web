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
        showPayButton: true
    });

    // Adyen Giving
    window.donation = checkout
        .create('donation', {
            onDonate: (state, component) => console.log({ state, component }),
            url: 'https://example.org',
            amounts: {
                currency: 'EUR',
                values: [300, 500, 1000]
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

    window.clickToPay = checkout
        .create('clickToPay', {
            clickToPayConfiguration: {
                schemas: {
                    mc: {
                        srcInitiatorId: '6d41d4d6-45b1-42c3-a5d0-a28c0e69d4b1',
                        srciDpaId: '6d41d4d6-45b1-42c3-a5d0-a28c0e69d4b1_dpa2',
                        srciTransactionId: 'adyen-id-' + new Date().getTime(),
                        dpaTransactionOptions: {
                            dpaLocale: 'en_US',
                            paymentOptions: {
                                dynamicDataType: 'CARD_APPLICATION_CRYPTOGRAM_SHORT_FORM'
                            },
                            consumerNameRequested: true
                        }
                    },
                    discovery: '',
                    visa: {
                        srciTransactionId: 'adyen-id-290202020',
                        srcInitiatorId: 'B9SECVKIQX2SOBQ6J9X721dVBBKHhJJl1nxxVbemHGn5oB6S8',
                        srciDpaId: '8e6e347c-254e-863f-0e6a-196bf2d9df02',
                        dpaData: {
                            //  "srcDpaId": "8e6e347c-254e-863f-0e6a-196bf2d9df02",
                            dpaPresentationName: 'Adyen Visa Click to Play Sandbox',
                            dpaUri: 'https://www.adyen.com',
                            dpaThreeDsPreference: 'UNKNOWN'
                        },
                        dpaTransactionOptions: {
                            dpaLocale: 'en_US',
                            dpaAcceptedBillingCountries: ['US', 'CA', 'NL'],
                            dpaAcceptedShippingCountries: ['US', 'CA', 'NL'],
                            dpaBillingPreference: 'ALL',
                            dpaShippingPreference: 'ALL',
                            consumerNameRequested: true,
                            consumerEmailAddressRequested: true,
                            consumerPhoneNumberRequested: true,
                            paymentOptions: {
                                dynamicDataType: 'TAVV',
                                dpaPanRequested: false
                            },
                            reviewAction: 'continue',
                            checkoutDescription: 'Sample checkout',
                            transactionType: 'PURCHASE',
                            orderType: 'REAUTHORIZATION',
                            payloadTypeIndicator: 'PAYMENT',
                            //  "merchantOrderId": "order-id-" + txId,
                            merchantCategoryCode: '5734',
                            merchantCountryCode: 'US'
                        }
                    }
                },
                shopperIdentity: {
                    // value: 'guilherme.ribeiro-visaclicktopay1@adyen.com', // WITH LEONARD PHONE
                    value: 'guilherme.ribeiro-ctp1@adyen.com',
                    // value: 'maximilian.maldacker-ctp2@adyen.com',
                    // value: 'guilherme-visaclicktopay1@adyen.com',
                    type: 'email'
                }
            }
        })
        .mount('.clicktopay-field');
});
