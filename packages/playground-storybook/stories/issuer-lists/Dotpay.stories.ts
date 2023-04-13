import { Meta, StoryObj } from '@storybook/html';
import { PaymentMethodStoryProps } from '../types';
import { UIElementProps } from '@adyen/adyen-web/dist/types/components/types';
import { addToWindow } from '../../utils/add-to-window';
import { getStoryContextCheckout } from '../../utils/get-story-context-checkout';

type DotpayStory = StoryObj<PaymentMethodStoryProps<UIElementProps>>;

const meta: Meta<PaymentMethodStoryProps<UIElementProps>> = {
    title: 'IssuerList/Dotpay'
};
export default meta;

export const Dotpay: DotpayStory = {
    render: (args, context) => {
        const checkout = getStoryContextCheckout(context);
        const container = document.createElement('div');
        const dotpay = checkout.create('dotpay', { ...args.componentConfiguration });
        dotpay.mount(container);
        addToWindow(dotpay);
        return container;
    },
    args: {
        countryCode: 'PL'
    }
};
