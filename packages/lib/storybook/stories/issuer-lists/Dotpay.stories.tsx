import { Meta, StoryObj } from '@storybook/preact';
import { PaymentMethodStoryProps } from '../types';
import { getStoryContextCheckout } from '../../utils/get-story-context-checkout';
import { UIElementProps } from '../../../src/components/types';
import { Container } from '../Container';

type DotpayStory = StoryObj<PaymentMethodStoryProps<UIElementProps>>;

const meta: Meta<PaymentMethodStoryProps<UIElementProps>> = {
    title: 'IssuerList/Dotpay'
};
export default meta;

export const Dotpay: DotpayStory = {
    render: (args, context) => {
        const checkout = getStoryContextCheckout(context);
        return <Container type={'dotpay'} componentConfiguration={args.componentConfiguration} checkout={checkout} />;
    },
    args: {
        countryCode: 'PL'
    }
};
