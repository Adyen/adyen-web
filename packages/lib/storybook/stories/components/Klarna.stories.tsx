import { Meta, StoryObj } from '@storybook/preact';
import { PaymentMethodStoryProps } from '../types';
import { getStoryContextCheckout } from '../../utils/get-story-context-checkout';
import { Container } from '../Container';
import { KlarnaPaymentsProps } from '../../../src/components/Klarna/types';

type KlarnaStory = StoryObj<PaymentMethodStoryProps<Partial<KlarnaPaymentsProps>>>;

const meta: Meta<PaymentMethodStoryProps<KlarnaPaymentsProps>> = {
    title: 'Components/Klarna'
};

const createComponent = (args, context) => {
    const checkout = getStoryContextCheckout(context);
    return <Container type={'klarna'} componentConfiguration={args.componentConfiguration} checkout={checkout} />;
};

export const Klarna: KlarnaStory = {
    render: createComponent,
    args: {
        countryCode: 'NL',
        componentConfiguration: { useKlarnaWidget: true }
    }
};

export default meta;
