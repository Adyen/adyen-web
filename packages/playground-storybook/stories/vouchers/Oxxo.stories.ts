import { Meta, StoryObj } from '@storybook/html';
import { PaymentMethodStoryProps } from '../types';
import { UIElementProps } from '@adyen/adyen-web/dist/types/components/types';
import { addToWindow } from '../../utils/add-to-window';
import { getStoryContextCheckout } from '../../utils/get-story-context-checkout';

type OxxoStory = StoryObj<PaymentMethodStoryProps<UIElementProps>>;

const meta: Meta<PaymentMethodStoryProps<UIElementProps>> = {
    title: 'Vouchers/Oxxo'
};
export default meta;

export const Oxxo: OxxoStory = {
    render: (args, context) => {
        const checkout = getStoryContextCheckout(context);
        const container = document.createElement('div');
        const oxxo = checkout.create('oxxo');
        oxxo.mount(container);
        addToWindow(oxxo);
        return container;
    },
    args: {
        countryCode: 'MX'
    }
};
