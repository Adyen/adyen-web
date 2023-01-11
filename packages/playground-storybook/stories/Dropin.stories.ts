import { Meta, StoryFn } from '@storybook/html';
import { DropinStoryProps } from './types';
import { addToWindow } from '../utils/add-to-window';
import { getStoryContextCheckout } from '../utils/get-story-context-checkout';

export default {
    title: 'Dropin/Default',
    argTypes: {
        componentConfiguration: {
            control: 'object',
            defaultValue: {
                instantPaymentTypes: ['googlepay']
            }
        },
        paymentMethodsConfiguration: {
            control: 'object',
            defaultValue: {
                googlepay: {
                    buttonType: 'plain'
                }
            }
        }
    }
} as Meta<DropinStoryProps>;

export const Dropin: StoryFn<DropinStoryProps> = (props, context): HTMLDivElement => {
    const checkout = getStoryContextCheckout(context);
    const container = document.createElement('div');
    const dropin = checkout.create('dropin', { ...props.componentConfiguration });
    dropin.mount(container);
    addToWindow(dropin);
    return container;
};
