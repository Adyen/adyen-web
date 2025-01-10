import { Meta, StoryObj } from '@storybook/preact';
import { PaymentMethodStoryProps } from '../types';
import { ComponentContainer } from '../ComponentContainer';
import { Checkout } from '../Checkout';
import PayTo, { PayToConfiguration } from '../../../src/components/PayTo/PayTo';

type PayToStory = StoryObj<PaymentMethodStoryProps<PayToConfiguration>>;

const meta: Meta<PaymentMethodStoryProps<PayToStory>> = {
    title: 'Components/PayTo'
};

export const Default: PayToStory = {
    render: ({ componentConfiguration, ...checkoutConfig }) => (
        <Checkout checkoutConfig={checkoutConfig}>
            {checkout => <ComponentContainer element={new PayTo(checkout, componentConfiguration)} />}
        </Checkout>
    ),
    args: {
        countryCode: 'AU',
        useSessions: false
    }
};
export default meta;
