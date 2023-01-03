import { Meta, StoryFn } from '@storybook/html';
import { DropinElementProps } from '@adyen/adyen-web/src/components/Dropin/types';
import { createCheckout } from '../helpers/create-checkout';
import { GlobalStoryProps } from './types';

type DropinStoryProps = GlobalStoryProps & {
    paymentMethodsConfiguration: any;
    componentConfiguration: DropinElementProps;
};

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
