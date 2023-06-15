// @ts-ignore ignore
import { h, Meta, StoryObj } from '@storybook/preact';
import { PaymentMethodStoryProps } from '../types';
import { getStoryContextCheckout } from '../../utils/get-story-context-checkout';
import { Container } from '../Container';
import { UIElementProps } from '../../../src/components/types';

type IdealStory = StoryObj<PaymentMethodStoryProps<UIElementProps>>;

const meta: Meta<PaymentMethodStoryProps<UIElementProps>> = {
    title: 'IssuerList/IDEAL'
};
export default meta;

const createComponent = (args, context) => {
    const checkout = getStoryContextCheckout(context);
    return <Container type={'ideal'} componentConfiguration={args.componentConfiguration} checkout={checkout} />;
};

export const Default: IdealStory = {
    render: createComponent,
    args: {
        countryCode: 'NL'
    }
};

export const WithHighlightedIssuers: IdealStory = {
    render: createComponent,
    args: {
        ...Default.args,
        componentConfiguration: {
            // @ts-ignore TODO: 'highlightedIssuers' is not documented
            highlightedIssuers: ['1121', '1154', '1153']
        }
    }
};
