import { h } from 'preact';
import { Meta, StoryObj } from '@storybook/preact-vite';
import { PaymentMethodStoryProps } from '../../../../storybook/types';
import { ComponentContainer } from '../../../../storybook/components/ComponentContainer';
import Paypal from '..';
import type { PayPalConfiguration } from '../types';
import { Checkout } from '../../../../storybook/components/Checkout';

type Story = StoryObj<PaymentMethodStoryProps<PayPalConfiguration>>;

const meta: Meta = {
    title: 'Components/Wallets/Paypal'
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
