import { Meta, StoryObj } from '@storybook/html';
import { PaymentMethodStoryProps } from '../types';
import { UIElementProps } from '@adyen/adyen-web/dist/types/components/types';
import { addToWindow } from '../../utils/add-to-window';
import { getStoryContextCheckout } from '../../utils/get-story-context-checkout';

type EntercashStory = StoryObj<PaymentMethodStoryProps<UIElementProps>>;

const meta: Meta<PaymentMethodStoryProps<UIElementProps>> = {
    title: 'IssuerList/Entercash'
};
export default meta;

export const Entercash: EntercashStory = {
    render: (args, context) => {
        const checkout = getStoryContextCheckout(context);
        const container = document.createElement('div');
        const entercash = checkout.create('entercash', { ...args.componentConfiguration });
        entercash.mount(container);
        addToWindow(entercash);
        return container;
    },
    args: {
        countryCode: 'FI'
    }
};
