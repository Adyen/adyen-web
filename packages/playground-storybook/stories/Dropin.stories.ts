import { Meta, StoryFn } from '@storybook/html';
import { createCheckout } from '../helpers/create-checkout';
import { DropinStoryProps } from './types';

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

export const Dropin: StoryFn<DropinStoryProps> = ({ componentConfiguration }, { loaded: { checkout } }): HTMLDivElement => {
    const container = document.createElement('div');
    const dropin = checkout.create('dropin', { ...componentConfiguration });
    dropin.mount(container);
    return container;
};

Dropin.loaders = [
    async context => {
        const checkout = await createCheckout(context);
        return { checkout };
    }
];
