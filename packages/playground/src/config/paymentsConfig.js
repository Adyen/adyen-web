import commonConfiguration from './commonConfig';

const identifier = new Date().getMilliseconds();
const { origin = 'http://localhost:3020', pathname, search } = window.location;
const returnUrl = origin + pathname + search;

const paymentsConfig = {
    ...commonConfiguration,
    origin,
    returnUrl,
    reference: `${identifier}-checkout-components-ref`,
    additionalData: {
        // Force response code. See https://docs.adyen.com/development-resources/test-cards/result-code-testing/adyen-response-codes
        // RequestedTestAcquirerResponseCode: 2,
        allow3DS2: true
        // To force threeds2InMDFlow:
        // comment out "allow3DS2" & comment in the following 2 lines:
        // threeDS2InMDFlow: true,
        // executeThreeD: true
    },
    // Ready for v69 - lose any additionalData 3DS2 related lines e.g. allow3DS2: true
    // authenticationData: {
    //     attemptAuthentication: 'always',
    //     // To force MDFlow: comment out below, and just keep line above
    //     threeDSRequestData: {
    //         nativeThreeDS: 'preferred'
    //     }
    // },
    shopperEmail: 'test-shopper@storytel.com',
    shopperIP: '172.30.0.1',
    // threeDS2RequestData: {
    //     authenticationOnly: false
    // },
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
        },
        {
            taxPercentage: 0,
            id: 'item2',
            taxAmount: 0,
            description: 'Test Item 2',
            amountIncludingTax: 10000,
            quantity: 1,
            taxCategory: 'None',
            amountExcludingTax: 10000
        }
    ]
};
export default paymentsConfig;
