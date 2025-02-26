import { Meta, StoryObj } from '@storybook/preact';
import { GlobalStoryProps, PaymentMethodStoryProps } from '../types';
import { ComponentContainer } from '../ComponentContainer';
import { Checkout } from '../Checkout';
import PayTo from '../../../src/components/PayTo/PayTo';
// import { http, HttpResponse } from 'msw';
import { MandateType, PayToConfiguration } from '../../../src/components/PayTo/types';

// extend the default story args so we can change mandate top level
interface ExtendedStoryArgs extends PaymentMethodStoryProps<PayToConfiguration> {
    mandate: MandateType;
    payee: string;
}
type PayToStory = StoryObj<ExtendedStoryArgs>;

const MANDATE_EXAMPLE: MandateType = {
    amount: '100000', // [Mandatory] for PayTo - Mandate Amount field
    amountRule: 'max', // [Mandatory] for PayTo - Needs to be Localised
    endsAt: '2027-12-31', // [Mandatory] for PayTo - Date format
    frequency: 'monthly', // [Mandatory] for PayTo - Needs to be Localised
    remarks: 'Demo mandate', // [Mandatory] for PayTo - Needs to be Localised as "Description"
    count: '10' // [Optional] will be returned only if the merchant sends it
    //startsAt: '2025-02-01' // [Optional] will be returned only if the merchant sends it
};

const meta: Meta<PaymentMethodStoryProps<PayToStory>> = {
    title: 'Components/PayTo',
    argTypes: {
        paymentsOptions: {
            control: 'object',
            if: { arg: 'useSessions', truthy: false }
        },
        sessionData: {
            control: 'object',
            if: { arg: 'useSessions', truthy: true }
        }
    },
    args: {}
};

const passMandateToPayments = (mandate: MandateType, checkoutConfig: GlobalStoryProps): GlobalStoryProps => {
    if (checkoutConfig.useSessions) {
        return {
            ...checkoutConfig,
            sessionData: {
                ...checkoutConfig.sessionData,
                mandate: mandate
            }
        };
    } else {
        return {
            ...checkoutConfig,
            paymentsOptions: {
                ...checkoutConfig.sessionData,
                mandate: mandate
            }
        };
    }
};

export const Default: PayToStory = {
    render: ({ componentConfiguration, mandate, ...checkoutConfig }) => (
        <Checkout checkoutConfig={passMandateToPayments(mandate, checkoutConfig)}>
            {checkout => (
                <ComponentContainer
                    element={
                        new PayTo(checkout, {
                            mandate,
                            ...componentConfiguration
                        })
                    }
                />
            )}
        </Checkout>
    ),
    args: {
        countryCode: 'AU',
        useSessions: false,
        mandate: MANDATE_EXAMPLE,
        amount: 2000
    }
};

export const PayToAwaitScreen: PayToStory = {
    args: {
        countryCode: 'AU',
        shopperLocale: 'en-US',
        mandate: MANDATE_EXAMPLE,
        payee: 'Cool Merchant Ltd',
        amount: 2000
    },
    parameters: {
        // msw: {
        //     handlers: [
        //         http.post('https://checkoutshopper-test.adyen.com/checkoutshopper/services/PaymentInitiation/v1/status', () => {
        //             return HttpResponse.json({
        //                 payload: '',
        //                 resultCode: 'pending',
        //                 type: 'pending'
        //             });
        //         })
        //     ]
        // }
    },
    render: ({ componentConfiguration, mandate, payee, ...checkoutConfig }) => (
        <Checkout checkoutConfig={passMandateToPayments(mandate, checkoutConfig)}>
            {checkout => (
                <ComponentContainer
                    element={
                        new PayTo(checkout, {
                            paymentData: 'Ab02b4c0....J86s=',
                            mandate,
                            payee,
                            ...componentConfiguration
                        })
                    }
                />
            )}
        </Checkout>
    )
};

export default meta;
