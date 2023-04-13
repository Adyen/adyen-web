import { Meta, StoryObj } from '@storybook/html';
import { DropinStoryProps } from './types';
import { addToWindow } from '../utils/add-to-window';
import { getStoryContextCheckout } from '../utils/get-story-context-checkout';

type DropinStory = StoryObj<DropinStoryProps>;

const meta: Meta<DropinStoryProps> = {
    title: 'Dropin/Default',
    argTypes: {
        componentConfiguration: {
            control: 'object'
        },
        paymentMethodsConfiguration: {
            control: 'object'
        }
    },
    args: {
        componentConfiguration: {
            instantPaymentTypes: ['googlepay']
        },
        paymentMethodsConfiguration: {
            googlepay: {
                buttonType: 'plain'
            }
        }
    }
};
export default meta;

export const Default: DropinStory = {
    render: (args, context) => {
        const checkout = getStoryContextCheckout(context);
        const container = document.createElement('div');
        const dropin = checkout.create('dropin', { ...args.componentConfiguration });
        dropin.mount(container);
        addToWindow(dropin);
        return container;
    }
};
