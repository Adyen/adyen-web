import { Meta, StoryObj } from '@storybook/preact';
import { PaymentMethodStoryProps } from '../types';
import { ComponentContainer } from '../ComponentContainer';
import { Checkout } from '../Checkout';
import PayTo, { PayToConfiguration } from '../../../src/components/PayTo/PayTo';

type PayToStory = StoryObj<PaymentMethodStoryProps<PayToConfiguration>>;

const meta: Meta<PaymentMethodStoryProps<PayToStory>> = {
    title: 'Components/PayTo'
};

// const payToPaymentObject = {
//     amount: {
//         currency: 'AUD', // [Mandatory] only supported value: "AUD"
//         value: 4200 // [Mandatory] { int: 1 to 1000000000 }
//     },
//     paymentMethod: {
//         type: 'payto', // [Mandatory]
//         shopperAccountIdentifier: '123456-98765432' // [Mandatory]
//     },
//     countryCode: 'AU', // [Mandatory]
//     merchantAccount: 'YOUR_MERCHANT_ACCOUNT', // [Mandatory]
//     reference: 'YOUR_ORDER_NUMBER', // [Mandatory]
//     mandate: {
//         amount: '42000', // [Mandatory] { int: 1 to 1000000000 }
//         amountRule: 'exact', // [Mandatory]
//         frequency: 'monthly', // [Mandatory] need to update docs to add "adhoc"
//         startsAt: '2024-10-01', // [Optional]
//         endsAt: '2027-10-01', // [Mandatory]
//         remarks: 'Remark on mandate', // [Mandatory]
//         count: '1' // [Conditional] new field
//     },
//     shopperName: { firstName: 'John', lastName: 'Doe' }, // [Mandatory]
//     shopperEmail: 's.hopper@example.com', // [Mandatory]
//     storePaymentMethod: true, // [Mandatory]
//     shopperInteraction: 'Ecommerce', // [Mandatory]
//     recurringProcessingModel: 'Subscription', // [Mandatory]
//     shopperReference: 'YOUR_SHOPPER_REFERENCE' // [Mandatory]
// };

const payToConfigurationObject = {
    mandate: {
        amount: '25900', // [Mandatory] { int: 1 to 1000000000 }
        amountRule: 'exact', // [Mandatory]
        frequency: 'monthly', // [Mandatory] need to update docs to add "adhoc"
        //startsAt: '2024-10-01', // [Optional]
        endsAt: '2027-10-01', // [Mandatory]
        remarks: 'Remark on mandate', // [Mandatory]
        count: '1' // [Conditional] new field
    },
    shopperEmail: 's.hopper@example.com' // [Mandatory]
};

export const Default: PayToStory = {
    render: ({ componentConfiguration, ...checkoutConfig }) => (
        <Checkout checkoutConfig={checkoutConfig}>
            {checkout => (
                <ComponentContainer
                    element={
                        new PayTo(checkout, {
                            ...payToConfigurationObject,
                            ...componentConfiguration
                        })
                    }
                />
            )}
        </Checkout>
    ),
    args: {
        countryCode: 'AU',
        useSessions: false
    }
};
export default meta;

// const paymentResponse = {
//     resultCode: 'Pending',
//     action: {
//         paymentData: 'Ab02b4c0....J86s=',
//         paymentMethodType: 'payto',
//         expiresAt: '2024-11-13T00:01:37Z',
//         mandate: {
//             amount: '4001', // [Mandatory] for PayTo - Mandate Amount field
//             amountRule: 'exact', // [Mandatory] for PayTo - Needs to be Localised
//             endsAt: '2024-12-31', // [Mandatory] for PayTo - Date format
//             frequency: 'adhoc', // [Mandatory] for PayTo - Needs to be Localised
//             remarks: 'testThroughFlow1', // [Mandatory] for PayTo - Needs to be Localised as "Description"
//             count: '3', // [Optional] will be returned only if the merchant sends it
//             startsAt: '2024-11-13' // [Optional] will be returned only if the merchant sends it
//         },
//         name: 'John Smitty', // Echo back the field passed in the request
//         shopperAccountIdentifier: 'test_again@test.com', // Echo back the field passed in the request
//         payee: '[MERCHANT_NAME]', // Merchant name displayed in the agreement
//         type: 'await'
//     }
// };

export const PayToAwaitScreen: PayToStory = {
    args: {
        countryCode: 'AU',
        shopperLocale: 'en-US'
    },
    render: ({ componentConfiguration, ...checkoutConfig }) => (
        <Checkout checkoutConfig={checkoutConfig}>
            {checkout => (
                <ComponentContainer
                    element={
                        new PayTo(checkout, {
                            paymentData: 'Ab02b4c0....J86s=',
                            mandate: {
                                amount: '25900', // [Mandatory] for PayTo - Mandate Amount field
                                amountRule: 'exact', // [Mandatory] for PayTo - Needs to be Localised
                                endsAt: '2024-12-31', // [Mandatory] for PayTo - Date format
                                frequency: 'adhoc', // [Mandatory] for PayTo - Needs to be Localised
                                remarks: 'testThroughFlow1', // [Mandatory] for PayTo - Needs to be Localised as "Description"
                                count: '3', // [Optional] will be returned only if the merchant sends it
                                startsAt: '2024-11-13' // [Optional] will be returned only if the merchant sends it
                            },
                            ...componentConfiguration
                        })
                    }
                />
            )}
        </Checkout>
    )
};
