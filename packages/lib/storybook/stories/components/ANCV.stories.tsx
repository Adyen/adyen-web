import { Meta, StoryObj } from '@storybook/preact';
import { PaymentMethodStoryProps } from '../types';
import { getStoryContextCheckout } from '../../utils/get-story-context-checkout';
import { Container } from '../Container';
import { ANCVProps } from '../../../src/components/ANCV/ANCV';

type ANCVStory = StoryObj<PaymentMethodStoryProps<ANCVProps>>;

const meta: Meta<PaymentMethodStoryProps<ANCVProps>> = {
    title: 'Components/ANCV'
};

export const ANCV: ANCVStory = {
    render: (args, context) => {
        const checkout = getStoryContextCheckout(context);
        return <Container type={'ancv'} componentConfiguration={args.componentConfiguration} checkout={checkout} />;
    },
    args: {
        countryCode: 'NL',
        amount: 2000,
        useSessions: false
    }
};
export default meta;
