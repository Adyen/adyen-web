import { Meta, StoryObj } from '@storybook/preact';
import { PaymentMethodStoryProps } from '../types';
import { getStoryContextCheckout } from '../../utils/get-story-context-checkout';
import { UIElementProps } from '../../../src/components/types';
import { Container } from '../Container';

type OxxoStory = StoryObj<PaymentMethodStoryProps<UIElementProps>>;

const meta: Meta<PaymentMethodStoryProps<UIElementProps>> = {
    title: 'Vouchers/Oxxo'
};
export default meta;

export const Oxxo: OxxoStory = {
    render: (args, context) => {
        const checkout = getStoryContextCheckout(context);
        return <Container type={'oxxo'} componentConfiguration={args.componentConfiguration} checkout={checkout} />;
    },
    args: {
        countryCode: 'MX'
    }
};
