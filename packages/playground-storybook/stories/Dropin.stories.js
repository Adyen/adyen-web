import { createAdvancedFlowCheckout } from '../helpers/create-advanced-checkout';
import { createSessionsCheckout } from '../helpers/create-sessions-checkout';

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
};

const createDropin = (checkout, { paymentMethodConfiguration, instantPaymentTypes, ...props }) => {
    const container = document.createElement('div');
    console.log(instantPaymentTypes);
    const dropin = checkout.create('dropin', { instantPaymentTypes });
    dropin.mount(container);
    return container;
};

const Template = (props, { loaded: { checkout } }) => {
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
