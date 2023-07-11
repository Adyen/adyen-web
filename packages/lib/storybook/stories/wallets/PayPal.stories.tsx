import { Meta, StoryObj } from '@storybook/preact';
import { PaymentMethodStoryProps } from '../types';
import { getStoryContextCheckout } from '../../utils/get-story-context-checkout';
import { PayPalElementProps } from '../../../src/components/PayPal/types';
import { Container } from '../Container';

type Story = StoryObj<PaymentMethodStoryProps<PayPalElementProps>>;

const meta: Meta = {
    title: 'Wallets/Paypal'
};
export default meta;

export const Paypal: Story = {
    render: (args, context) => {
        const checkout = getStoryContextCheckout(context);
        return <Container type={'paypal'} componentConfiguration={args.componentConfiguration} checkout={checkout} />;
    }
};
