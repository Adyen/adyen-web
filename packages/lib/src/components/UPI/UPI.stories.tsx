import { h } from 'preact';
import { MetaConfiguration, PaymentMethodStoryProps, StoryConfiguration } from '../../../storybook/types';
import { UPIConfiguration } from './types';
import { ComponentContainer } from '../../../storybook/components/ComponentContainer';
import { Checkout } from '../../../storybook/components/Checkout';
import UPI from './UPI';
import { MandateType } from '../types';
import { Mandate } from './components/UPIMandate/UPIMandate';

type UpiStory = StoryConfiguration<UPIConfiguration>;

const meta: MetaConfiguration<UPIConfiguration> = {
    title: 'Components/UPI'
};

export const Default: UpiStory = {
    render: ({ componentConfiguration, ...checkoutConfig }: PaymentMethodStoryProps<UPIConfiguration>) => (
        <Checkout checkoutConfig={checkoutConfig}>{checkout => <ComponentContainer element={new UPI(checkout, componentConfiguration)} />}</Checkout>
    ),
    args: {
        countryCode: 'IN',
        amount: 1005,
        componentConfiguration: {
            onChange(state) {
                console.log({ state });
            }
        }
    }
};

const MANDATE = {
    amount: '7005',
    frequency: 'monthly',
    amountRule: 'max',
    endsAt: '2030-07-21',
    remarks: 'Monthly subscription'
};

export const AutoPaySession: UpiStory = {
    render: ({ componentConfiguration, ...checkoutConfig }: PaymentMethodStoryProps<UPIConfiguration>) => (
        <Checkout checkoutConfig={checkoutConfig}>{checkout => <ComponentContainer element={new UPI(checkout, componentConfiguration)} />}</Checkout>
    ),
    args: {
        countryCode: 'IN',
        amount: 7005,
        useSessions: true,
        sessionData: {
            mandate: MANDATE as Partial<MandateType>,
            shopperReference: 'upi-autopay-shopper',
            storePaymentMethod: true,
            shopperInteraction: 'Ecommerce',
            recurringProcessingModel: 'Subscription'
        },
        componentConfiguration: {
            mandate: MANDATE as Mandate
        }
    }
};

export default meta;
