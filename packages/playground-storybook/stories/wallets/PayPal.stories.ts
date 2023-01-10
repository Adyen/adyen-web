import { Meta, StoryFn } from '@storybook/html';
import { PaymentMethodStoryProps } from '../types';
import { PayPalElementProps } from '@adyen/adyen-web/dist/types/components/PayPal/types';
import { createCheckout } from '../../helpers/create-checkout';

export default {
    title: 'Wallets/Paypal'
} as Meta;

export const Paypal: StoryFn<PaymentMethodStoryProps<PayPalElementProps>> = (
    props: PaymentMethodStoryProps<PayPalElementProps>,
    { loaded: { checkout } }
): HTMLDivElement => {
    const container = document.createElement('div');
    const paypal = checkout.create('paypal');
    paypal.mount(container);
    return container;
};

Paypal.loaders = [
    async context => {
        const checkout = await createCheckout(context);
        return { checkout };
    }
];
