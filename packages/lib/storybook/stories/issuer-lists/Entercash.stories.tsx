import { Meta, StoryObj } from '@storybook/preact';
import { PaymentMethodStoryProps } from '../types';
import { getStoryContextCheckout } from '../../utils/get-story-context-checkout';
import { UIElementProps } from '../../../src/components/types';
import { Container } from '../Container';

type EntercashStory = StoryObj<PaymentMethodStoryProps<UIElementProps>>;

const meta: Meta<PaymentMethodStoryProps<UIElementProps>> = {
    title: 'IssuerList/Entercash'
};
export default meta;

export const Entercash: EntercashStory = {
    render: (args, context) => {
        const checkout = getStoryContextCheckout(context);
        return <Container type={'entercash'} componentConfiguration={args.componentConfiguration} checkout={checkout} />;
    },
    args: {
        countryCode: 'FI'
    }
};
