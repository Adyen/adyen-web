import { Meta, StoryObj } from '@storybook/html';
import { PaymentMethodStoryProps } from '../types';
import { PayPalElementProps } from '@adyen/adyen-web/dist/types/components/PayPal/types';
import { addToWindow } from '../../utils/add-to-window';
import { getStoryContextCheckout } from '../../utils/get-story-context-checkout';

type Story = StoryObj<PaymentMethodStoryProps<PayPalElementProps>>;

const meta: Meta = {
    title: 'Wallets/Paypal'
};
export default meta;

export const Paypal: Story = {
    render: (args, context) => {
        const checkout = getStoryContextCheckout(context);
        const container = document.createElement('div');
        const paypal = checkout.create('paypal');
        paypal.mount(container);
        addToWindow(paypal);
        return container;
    }
};
