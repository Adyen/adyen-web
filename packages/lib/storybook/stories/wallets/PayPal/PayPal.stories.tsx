import { Meta, StoryObj } from '@storybook/preact';
import { PaymentMethodStoryProps } from '../../types';
import { ComponentContainer } from '../../ComponentContainer';
import Paypal from '../../../../src/components/PayPal';
import type { PayPalConfiguration } from '../../../../src/components/PayPal/types';
import { Checkout } from '../../Checkout';

type Story = StoryObj<PaymentMethodStoryProps<PayPalConfiguration>>;

const meta: Meta = {
    title: 'Wallets/Paypal'
};
export default meta;

export const Default: Story = {
    render: ({ componentConfiguration, ...checkoutConfig }) => (
        <Checkout checkoutConfig={checkoutConfig}>
            {checkout => <ComponentContainer element={new Paypal(checkout, componentConfiguration)} />}
        </Checkout>
    ),
    args: {
        componentConfiguration: {
            blockPayPalCreditButton: false,
            blockPayPalPayLaterButton: false,
            blockPayPalVenmoButton: false
        }
    }
};
