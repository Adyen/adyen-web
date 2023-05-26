// @ts-ignore
import { h, Meta, StoryObj } from '@storybook/preact';
import { DropinStoryProps } from './types';
import { getStoryContextCheckout } from '../utils/get-story-context-checkout';
import { Container } from './Container';

type DropinStory = StoryObj<DropinStoryProps>;

const meta: Meta<DropinStoryProps> = {
    title: 'Dropin/Default',
    argTypes: {
        componentConfiguration: {
            control: 'object'
        },
        paymentMethodsConfiguration: {
            control: 'object'
        }
    },
    args: {
        componentConfiguration: {
            instantPaymentTypes: ['googlepay']
        },
        paymentMethodsConfiguration: {
            googlepay: {
                buttonType: 'plain'
            }
        }
    }
};

export default meta;

export const Default: DropinStory = {
    render: (args, context) => {
        const checkout = getStoryContextCheckout(context);
        return <Container type={'dropin'} componentConfiguration={args.componentConfiguration} checkout={checkout} />;
    }
};
