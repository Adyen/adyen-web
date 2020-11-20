import commonConfiguration from './commonConfig';

const identifier = new Date().getMilliseconds();
const { origin = 'http://localhost:3024', search } = window.location;
const returnUrl = origin + search;

const paymentsConfig = {
    ...commonConfiguration,
    origin,
    returnUrl,
    reference: `${identifier}-checkout-components-ref`,
    additionalData: {
        allow3DS2: true
    },
    shopperEmail: 'test@adyen.com',
    shopperIP: '172.30.0.1',
    channel: 'Web',
    browserInfo: {
        acceptHeader: 'http'
    },
    lineItems: [
        {
            taxPercentage: 0,
            id: 'item1',
            taxAmount: 0,
            description: 'Test Item 1',
            amountIncludingTax: 75900,
            quantity: 1,
            taxCategory: 'None',
            amountExcludingTax: 75900
        }
    ]
};
export default paymentsConfig;
