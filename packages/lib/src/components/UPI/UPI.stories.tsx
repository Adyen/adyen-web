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
        componentConfiguration: {
            onChange(state) {
                console.log({ state });
            }
        }
    }
};

const MANDATE = { amount: '30000', frequency: 'monthly', amountRule: 'max' };

export const AutoPaySession: UpiStory = {
    render: ({ componentConfiguration, ...checkoutConfig }: PaymentMethodStoryProps<UPIConfiguration>) => (
        <Checkout checkoutConfig={checkoutConfig}>{checkout => <ComponentContainer element={new UPI(checkout, componentConfiguration)} />}</Checkout>
    ),
    args: {
        countryCode: 'IN',
        useSessions: true,
        sessionData: { mandate: MANDATE as Partial<MandateType> },
        componentConfiguration: {
            mandate: MANDATE as Mandate
        }
    }
};

export default meta;
