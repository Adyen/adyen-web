import { Meta, StoryFn } from '@storybook/html';
import { DropinStoryProps } from './types';
import { addToWindow } from '../utils/add-to-window';

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
    addToWindow(dropin);
    return container;
};
