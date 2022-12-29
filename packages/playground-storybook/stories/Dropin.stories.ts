import { Meta, StoryFn } from '@storybook/html';
import { createAdvancedFlowCheckout } from '../helpers/create-advanced-checkout';
import { createSessionsCheckout } from '../helpers/create-sessions-checkout';
import { DropinElementProps } from '@adyen/adyen-web/src/components/Dropin/types';

type DropinProps = Pick<DropinElementProps, 'instantPaymentTypes'>;

export default {
    title: 'Dropin',
    argTypes: {
        useSessions: {
            defaultValue: 'true',
            control: 'boolean'
        },
        showPayButton: {
            defaultValue: 'true',
            control: 'boolean'
        },
        instantPaymentTypes: {
            control: 'inline-check',
            options: ['googlepay', 'applepay'],
            defaultValue: ['googlepay']
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
} as Meta<DropinProps>;

function createDropin(checkout, { instantPaymentTypes, ...props }: DropinProps): HTMLDivElement {
    const container = document.createElement('div');
    const dropin = checkout.create('dropin', { instantPaymentTypes });
    dropin.mount(container);
    return container;
}

const Template: StoryFn<DropinProps> = (props, { loaded: { checkout } }): HTMLDivElement => {
    return createDropin(checkout, props);
};
export const Dropin = Template.bind({});
Dropin.loaders = [
    async context => {
        const { useSessions, paymentMethodsConfiguration, showPayButton } = context.args;
        const checkout = useSessions
            ? await createSessionsCheckout({ showPayButton, paymentMethodsConfiguration })
            : await createAdvancedFlowCheckout({ showPayButton, paymentMethodsConfiguration });
        return { checkout };
    }
];
