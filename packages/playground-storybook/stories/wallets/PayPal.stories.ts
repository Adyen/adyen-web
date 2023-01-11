import { Meta, StoryFn } from '@storybook/html';
import { PaymentMethodStoryProps } from '../types';
import { PayPalElementProps } from '@adyen/adyen-web/dist/types/components/PayPal/types';
import { addToWindow } from '../../utils/add-to-window';
import { getStoryContextCheckout } from '../../utils/get-story-context-checkout';

export default {
    title: 'Wallets/Paypal'
} as Meta;

export const Paypal: StoryFn<PaymentMethodStoryProps<PayPalElementProps>> = (props, context): HTMLDivElement => {
    const checkout = getStoryContextCheckout(context);
    const container = document.createElement('div');
    const paypal = checkout.create('paypal');
    paypal.mount(container);
    addToWindow(paypal);
    return container;
};
