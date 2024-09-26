import { Meta, StoryObj } from '@storybook/preact';
import { PaymentMethodStoryProps } from '../../types';
import { getStoryContextCheckout } from '../../../utils/get-story-context-checkout';
import { ComponentContainer } from '../../ComponentContainer';
import Paypal from '../../../../src/components/PayPal';
import type { PayPalConfiguration } from '../../../../src/components/PayPal/types';

type Story = StoryObj<PaymentMethodStoryProps<PayPalConfiguration>>;

const meta: Meta = {
    title: 'Wallets/Paypal'
};
export default meta;

export const Default: Story = {
    render: (args, context) => {
        const { componentConfiguration } = args;
        const checkout = getStoryContextCheckout(context);
        const paypal = new Paypal(checkout, componentConfiguration);
        return <ComponentContainer element={paypal} />;
    }
};
