import { Meta, StoryFn } from '@storybook/html';
import { createSessionsCheckout } from '../../helpers/create-sessions-checkout';
import { createAdvancedFlowCheckout } from '../../helpers/create-advanced-checkout';
import { GlobalStoryProps } from '../types';
import { PayPalElementProps } from '@adyen/adyen-web/dist/types/components/PayPal/types';
import { createCheckout } from '../../helpers/create-checkout';

type PaypalStoryProps = GlobalStoryProps & {
    componentConfiguration: PayPalElementProps;
};

export default {
    title: 'Wallets/Paypal'
} as Meta;

export const Paypal: StoryFn<PaypalStoryProps> = (props: PaypalStoryProps, { loaded: { checkout } }): HTMLDivElement => {
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
