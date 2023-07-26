import { Meta, StoryObj } from '@storybook/preact';
import { PaymentMethodStoryProps } from '../types';
import { getStoryContextCheckout } from '../../utils/get-story-context-checkout';
import { Container } from '../Container';
import { GooglePayProps } from '../../../src/components/GooglePay/types';

type Story = StoryObj<PaymentMethodStoryProps<GooglePayProps>>;

const meta: Meta = {
    title: 'Wallets/GooglePay'
};
export default meta;

const createComponent = (args, context) => {
    const checkout = getStoryContextCheckout(context);
    return <Container type={'googlepay'} componentConfiguration={args.componentConfiguration} checkout={checkout} />;
};

export const Default: Story = {
    render: createComponent
};
