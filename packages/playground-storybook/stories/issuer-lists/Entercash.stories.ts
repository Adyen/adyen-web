import { Meta, StoryFn } from '@storybook/html';
import { PaymentMethodStoryProps } from '../types';
import { UIElementProps } from '@adyen/adyen-web/dist/types/components/types';
import { addToWindow } from '../../utils/add-to-window';
import { getStoryContextCheckout } from '../../utils/get-story-context-checkout';

export default {
    title: 'IssuerLists/Entercash'
} as Meta;

const Template: StoryFn<PaymentMethodStoryProps<UIElementProps>> = (props, context): HTMLDivElement => {
    const checkout = getStoryContextCheckout(context);
    const container = document.createElement('div');
    const entercash = checkout.create('entercash', { ...props.componentConfiguration });
    entercash.mount(container);
    addToWindow(entercash);
    return container;
};

export const Default = Template.bind({}) as StoryFn<PaymentMethodStoryProps<UIElementProps>>;
Default.args = {
    countryCode: 'FI'
};
