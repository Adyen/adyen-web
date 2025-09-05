import { MetaConfiguration, PaymentMethodStoryProps, StoryConfiguration } from '../types';
import { UPIConfiguration } from '../../../src/components/UPI/types';
import { ComponentContainer } from '../ComponentContainer';
import { Checkout } from '../Checkout';
import UPI from '../../../src/components/UPI/UPI';

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

export const AutoPaySession: UpiStory = {
    render: ({ componentConfiguration, ...checkoutConfig }: PaymentMethodStoryProps<UPIConfiguration>) => (
        <Checkout checkoutConfig={checkoutConfig}>{checkout => <ComponentContainer element={new UPI(checkout, componentConfiguration)} />}</Checkout>
    ),
    args: {
        countryCode: 'IN',
        useSessions: true,
        sessionData: { mandate: { amount: '30000', frequency: 'monthly', amountRule: 'max' } },
        componentConfiguration: {
            mandate: { amount: '30000', frequency: 'monthly', amountRule: 'max' }
        }
    }
};

export default meta;
