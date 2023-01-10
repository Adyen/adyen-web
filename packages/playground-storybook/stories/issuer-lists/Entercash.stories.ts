import { Meta, StoryFn } from '@storybook/html';
import { PaymentMethodStoryProps } from '../types';
import { UIElementProps } from '@adyen/adyen-web/dist/types/components/types';
import { createCheckout } from '../../helpers/create-checkout';

export default {
    title: 'IssuerLists/Entercash'
} as Meta;

const Template: StoryFn<PaymentMethodStoryProps<UIElementProps>> = (
    props: PaymentMethodStoryProps<UIElementProps>,
    { loaded: { checkout } }
): HTMLDivElement => {
    const container = document.createElement('div');
    const entercash = checkout.create('entercash', { ...props.componentConfiguration });
    entercash.mount(container);
    return container;
};

export const Default = Template.bind({}) as StoryFn<PaymentMethodStoryProps<UIElementProps>>;
Default.args = {
    countryCode: 'FI'
};
Default.loaders = [
    async context => {
        const checkout = await createCheckout(context);
        return { checkout };
    }
];
