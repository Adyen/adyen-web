import { Meta, StoryFn } from '@storybook/html';
import { PaymentMethodStoryProps } from '../types';
import { UIElementProps } from '@adyen/adyen-web/dist/types/components/types';
import { createCheckout } from '../../helpers/create-checkout';
import { addToWindow } from '../../utils/add-to-window';

export default {
    title: 'Vouchers/Oxxo'
} as Meta;

export const Oxxo: StoryFn<PaymentMethodStoryProps<UIElementProps>> = (
    props: PaymentMethodStoryProps<UIElementProps>,
    { loaded: { checkout } }
): HTMLDivElement => {
    const container = document.createElement('div');
    const oxxo = checkout.create('oxxo');
    oxxo.mount(container);
    addToWindow(oxxo);
    return container;
};

Oxxo.args = {
    countryCode: 'MX'
};

Oxxo.loaders = [
    async context => {
        const checkout = await createCheckout(context);
        return { checkout };
    }
];
