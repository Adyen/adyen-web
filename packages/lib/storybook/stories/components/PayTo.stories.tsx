import { Meta, StoryObj } from '@storybook/preact';
import { PaymentMethodStoryProps } from '../types';
import { ComponentContainer } from '../ComponentContainer';
import { Checkout } from '../Checkout';
import PayTo from '../../../src/components/PayTo/PayTo';
import { http, HttpResponse } from 'msw';
import { MandateType, PayToConfiguration } from '../../../src/components/PayTo/types';

// extend the default story args so we can change mandate top level
interface ExtendedStoryArgs extends PaymentMethodStoryProps<PayToConfiguration> {
    mandate: MandateType;
    payee: string;
}
type PayToStory = StoryObj<ExtendedStoryArgs>;

const MANDATE_EXAMPLE: MandateType = {
    amount: '100000', // [Mandatory] for PayTo - Mandate Amount field
    amountRule: 'exact', // [Mandatory] for PayTo - Needs to be Localised
    endsAt: '2025-12-31', // [Mandatory] for PayTo - Date format
    frequency: 'monthly', // [Mandatory] for PayTo - Needs to be Localised
    remarks: 'testThroughFlow1', // [Mandatory] for PayTo - Needs to be Localised as "Description"
    count: '3' // [Optional] will be returned only if the merchant sends it
    //startsAt: '2025-02-01' // [Optional] will be returned only if the merchant sends it
};

const meta: Meta<PaymentMethodStoryProps<PayToStory>> = {
    title: 'Components/PayTo'
};

export const Default: PayToStory = {
    render: ({ componentConfiguration, mandate, ...checkoutConfig }) => (
        <Checkout checkoutConfig={checkoutConfig}>
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
        mandate: MANDATE_EXAMPLE
    }
};

export const PayToAwaitScreen: PayToStory = {
    args: {
        countryCode: 'AU',
        shopperLocale: 'en-US',
        mandate: MANDATE_EXAMPLE,
        payee: 'Cool Merchant Ltd'
    },
    parameters: {
        msw: {
            handlers: [
                http.post('https://checkoutshopper-test.adyen.com/checkoutshopper/services/PaymentInitiation/v1/status', () => {
                    return HttpResponse.json({
                        payload: '',
                        resultCode: 'pending',
                        type: 'pending'
                    });
                })
            ]
        }
    },
    render: ({ componentConfiguration, mandate, payee, ...checkoutConfig }) => (
        <Checkout checkoutConfig={checkoutConfig}>
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
