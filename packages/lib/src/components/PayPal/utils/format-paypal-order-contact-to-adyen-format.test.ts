import { formatPaypalOrderContactToAdyenFormat } from './format-paypal-order-contact-to-adyen-format';

const paypalAuthorizedEvent: any = {
    id: '74F37708H4524480V',
    intent: 'AUTHORIZE',
    status: 'APPROVED',
    purchase_units: [
        {
            reference_id: 'default',
            amount: {
                currency_code: 'USD',
                value: '265.99',
                breakdown: {
                    item_total: {
                        currency_code: 'USD',
                        value: '250.00'
                    },
                    shipping: {
                        currency_code: 'USD',
                        value: '15.99'
                    }
                }
            },
            payee: {
                email_address: 'sell1_1287491142_biz@adyen.com',
                merchant_id: 'M6TNAESZ5FGNN',
                display_data: {
                    brand_name: 'TestMerchantCheckout'
                }
            },
            custom_id: 'TestMerchantCheckout:pub.v2.8115658705713940.a4Emqe6G-EueTjFogWUNHbARjs036ujUj8pgkf0Qbnw:58499:GMZ7B4X28BL4QM65:paypal',
            invoice_id: 'GMZ7B4X28BL4QM65',
            soft_descriptor: '387-checkout-component',
            shipping: {
                name: {
                    full_name: 'Simon Hopper'
                },
                address: {
                    address_line_1: '274 Brannan St.',
                    admin_area_2: 'San Francisco',
                    admin_area_1: 'CA',
                    postal_code: '94107',
                    country_code: 'US'
                },
                options: [
                    {
                        id: '1',
                        label: 'Express Shipping',
                        type: 'SHIPPING',
                        amount: {
                            currency_code: 'USD',
                            value: '15.99'
                        },
                        selected: true
                    }
                ]
            }
        }
    ],
    payer: {
        name: {
            given_name: 'Test',
            surname: 'User'
        },
        email_address: 'buy1_1287492020_per@adyen.com',
        payer_id: '8QNW9UFUKS9ZC',
        phone: {
            phone_type: 'HOME',
            phone_number: {
                national_number: '7465704409'
            }
        },
        address: {
            address_line_1: '1 Main St',
            admin_area_2: 'San Jose',
            admin_area_1: 'CA',
            postal_code: '95131',
            country_code: 'US'
        }
    },
    create_time: '2024-02-23T11:35:05Z',
    links: [
        {
            href: 'https://api.sandbox.paypal.com/v2/checkout/orders/74F37708H4524480V',
            rel: 'self',
            method: 'GET'
        },
        {
            href: 'https://api.sandbox.paypal.com/v2/checkout/orders/74F37708H4524480V',
            rel: 'update',
            method: 'PATCH'
        },
        {
            href: 'https://api.sandbox.paypal.com/v2/checkout/orders/74F37708H4524480V/authorize',
            rel: 'authorize',
            method: 'POST'
        }
    ]
};

describe('formatPaypalOrderContactToAdyenFormat', () => {
    test('should format billing address', () => {
        const billingAddress = formatPaypalOrderContactToAdyenFormat(paypalAuthorizedEvent.payer, false);
        expect(billingAddress).toStrictEqual({
            houseNumberOrName: 'ZZ',
            street: '1 Main St',
            stateOrProvince: 'CA',
            city: 'San Jose',
            postalCode: '95131',
            country: 'US'
        });
    });

    test('should format delivery address', () => {
        const deliveryAddress = formatPaypalOrderContactToAdyenFormat(paypalAuthorizedEvent.purchase_units?.[0].shipping, true);
        expect(deliveryAddress).toStrictEqual({
            houseNumberOrName: 'ZZ',
            street: '274 Brannan St.',
            stateOrProvince: 'CA',
            city: 'San Francisco',
            postalCode: '94107',
            country: 'US',
            firstName: 'Simon Hopper'
        });
    });

    test('should return null if paypal object is not in the expected format', () => {
        const data = formatPaypalOrderContactToAdyenFormat({});
        expect(data).toBeNull();
    });
});
