import { Meta, StoryFn } from '@storybook/html';
import { PaymentMethodStoryProps } from '../types';
import { UIElementProps } from '@adyen/adyen-web/dist/types/components/types';
import { createCheckout } from '../../helpers/create-checkout';
import { addToWindow } from '../../utils/add-to-window';

export default {
    title: 'IssuerLists/Dotpay'
} as Meta;

const Template: StoryFn<PaymentMethodStoryProps<UIElementProps>> = (
    props: PaymentMethodStoryProps<UIElementProps>,
    { loaded: { checkout } }
): HTMLDivElement => {
    const container = document.createElement('div');
    const dotpay = checkout.create('dotpay', { ...props.componentConfiguration });
    dotpay.mount(container);
    addToWindow(dotpay);
    return container;
};

export const Default = Template.bind({}) as StoryFn<PaymentMethodStoryProps<UIElementProps>>;
Default.args = {
    countryCode: 'PL'
};
Default.loaders = [
    async context => {
        const checkout = await createCheckout(context);
        return { checkout };
    }
];
