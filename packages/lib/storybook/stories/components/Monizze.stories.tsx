import { Meta, StoryObj } from '@storybook/preact';
import { PaymentMethodStoryProps } from '../types';
import { getStoryContextCheckout } from '../../utils/get-story-context-checkout';
import { Container } from '../Container';
import { ANCVProps } from '../../../src/components/ANCV/ANCV';
import MonizzeElement from '../../../src/components/Monizze';

type MonizzeStory = StoryObj<PaymentMethodStoryProps<MonizzeElement>>;

const meta: Meta<PaymentMethodStoryProps<ANCVProps>> = {
    title: 'Components/Monizze'
};

export const Monizze: MonizzeStory = {
    render: (args, context) => {
        const checkout = getStoryContextCheckout(context);
        return <Container type={'monizze_mealvoucher'} componentConfiguration={args.componentConfiguration} checkout={checkout} />;
    },
    args: {
        countryCode: 'BE',
        amount: 2000,
        useSessions: false
    }
};
export default meta;
