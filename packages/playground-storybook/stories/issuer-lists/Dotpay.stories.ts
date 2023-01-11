import { Meta, StoryFn } from '@storybook/html';
import { PaymentMethodStoryProps } from '../types';
import { UIElementProps } from '@adyen/adyen-web/dist/types/components/types';
import { addToWindow } from '../../utils/add-to-window';
import { getStoryContextCheckout } from '../../utils/get-story-context-checkout';

export default {
    title: 'IssuerLists/Dotpay'
} as Meta;

const Template: StoryFn<PaymentMethodStoryProps<UIElementProps>> = (props, context): HTMLDivElement => {
    const checkout = getStoryContextCheckout(context);
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
