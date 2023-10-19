import { Meta, StoryObj } from '@storybook/preact';
import { PaymentMethodStoryProps } from '../types';
import { getStoryContextCheckout } from '../../utils/get-story-context-checkout';
import { Container } from '../Container';
import { ApplePayElementProps } from '../../../src/components/ApplePay/types';

type Story = StoryObj<PaymentMethodStoryProps<ApplePayElementProps>>;

const meta: Meta = {
    title: 'Wallets/ApplePay'
};
export default meta;

const createComponent = (args, context) => {
    const checkout = getStoryContextCheckout(context);
    return <Container type={'applepay'} componentConfiguration={args.componentConfiguration} checkout={checkout} />;
};

export const Default: Story = {
    render: createComponent,
    args: {
        componentConfiguration: {
            countryCode: 'US'
        }
    }
};
