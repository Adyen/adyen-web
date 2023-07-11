import { Meta, StoryObj } from '@storybook/preact';
import { PaymentMethodStoryProps } from '../types';
import { getStoryContextCheckout } from '../../utils/get-story-context-checkout';
import { PixProps } from '../../../src/components/Pix/types';
import { Container } from '../Container';

type PixStory = StoryObj<PaymentMethodStoryProps<PixProps>>;

const meta: Meta<PaymentMethodStoryProps<PixProps>> = {
    title: 'Components/Pix'
};
export default meta;

const createComponent = (args, context) => {
    const checkout = getStoryContextCheckout(context);
    return <Container type={'pix'} componentConfiguration={args.componentConfiguration} checkout={checkout} />;
};

export const Default: PixStory = {
    render: createComponent,
    args: {
        countryCode: 'BR'
    }
};

export const WithPersonalDetails: PixStory = {
    render: createComponent,
    args: {
        ...Default.args,
        // @ts-ignore TODO: Make Pix 'introduction' prop optional
        componentConfiguration: {
            personalDetailsRequired: true
        }
    }
};
