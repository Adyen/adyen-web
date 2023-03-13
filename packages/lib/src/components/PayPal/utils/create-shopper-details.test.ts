import { createShopperDetails } from './create-shopper-details';
import { ShopperDetails } from '../../../types';

const expectedShopperDetails: ShopperDetails = {
    shopperName: { firstName: 'Test', lastName: 'User' },
    shopperEmail: 'shopper@example.com',
    telephoneNumber: '7465704409',
    countryCode: 'US',
    billingAddress: { street: '1 Main St', stateOrProvince: 'CA', city: 'San Jose', postalCode: '95131', country: 'US' },
    shippingAddress: { street: '6-50 Simon Carmiggeltstraat', city: 'Amsterdam', postalCode: '1011DJ', country: 'NL' }
};

const paypalOrderData = {
    create_time: '2023-03-09T10:08:54Z',
    id: '7KN17760594192819',
    intent: 'AUTHORIZE',
    status: 'APPROVED',
    payer: {
        email_address: 'shopper@example.com',
        payer_id: '8QNW9UFUKS9ZC',
        address: {
            address_line_1: '1 Main St',
            admin_area_2: 'San Jose',
            admin_area_1: 'CA',
            postal_code: '95131',
            country_code: 'US'
        },
        name: {
            given_name: 'Test',
            surname: 'User'
        },
        phone: {
            phone_type: 'HOME',
            phone_number: {
                national_number: '7465704409'
            }
        }
    },
    purchase_units: [
        {
            reference_id: 'default',
            custom_id: 'TestMerchantCheckout:pub.v2.8115658705713940.a4Emqe6G-EueTjFogWUNHbARjs036ujUj8pgkf0Qbnw:645042:N6SWRQ7CQGNG5S82:paypal',
            invoice_id: 'N6SWRQ7CQGNG5S82',
            soft_descriptor: '150-checkout-component',
            amount: {
                value: '259.00',
                currency_code: 'USD'
            },
            payee: {
                email_address: 'seller_1306503918_biz@adyen.com',
                merchant_id: 'QSXMR9W7GV8NY',
                display_data: {
                    brand_name: 'TestMerchantCheckout'
                }
            },
            shipping: {
                name: {
                    full_name: 'Jaap Stam'
                },
                address: {
                    address_line_1: '6-50 Simon Carmiggeltstraat',
                    admin_area_2: 'Amsterdam',
                    postal_code: '1011DJ',
                    country_code: 'NL'
                }
            }
        }
    ]
};

test('should format Paypal Order v2 payload to Adyen ShopperDetails format ', () => {
    expect(createShopperDetails(paypalOrderData)).toEqual(expectedShopperDetails);
});

test('should return null if Paypal order is empty', () => {
    expect(createShopperDetails({})).toBeNull();
    expect(createShopperDetails(null)).toBeNull();
    expect(createShopperDetails(undefined)).toBeNull();
});
