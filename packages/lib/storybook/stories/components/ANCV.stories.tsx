import { Meta, StoryObj } from '@storybook/preact';
import { PaymentMethodStoryProps } from '../types';
import { getStoryContextCheckout } from '../../utils/get-story-context-checkout';
import { Container } from '../Container';
import { ANCVProps } from '../../../src/components/ANCV/ANCV';
import { ANCV } from '../../../src';

type ANCVStory = StoryObj<PaymentMethodStoryProps<ANCVProps>>;

const meta: Meta<PaymentMethodStoryProps<ANCVProps>> = {
    title: 'Components/ANCV'
};

export const Default: ANCVStory = {
    render: (args, context) => {
        const { componentConfiguration } = args;
        const checkout = getStoryContextCheckout(context);
        const ancv = new ANCV({ core: checkout, ...componentConfiguration });
        return <Container element={ancv} />;
    },
    args: {
        countryCode: 'NL',
        amount: 2000,
        useSessions: false
    }
};
export default meta;
