import { Meta, StoryObj } from '@storybook/html';
import { PaymentMethodStoryProps } from '../types';
import { UIElementProps } from '@adyen/adyen-web/dist/types/components/types';
import { addToWindow } from '../../utils/add-to-window';
import { getStoryContextCheckout } from '../../utils/get-story-context-checkout';

type IdealStory = StoryObj<PaymentMethodStoryProps<UIElementProps>>;

const meta: Meta<PaymentMethodStoryProps<UIElementProps>> = {
    title: 'Iss<uerList/IDEAL'
};
export default meta;

const createComponent = (args, context) => {
    const checkout = getStoryContextCheckout(context);
    const container = document.createElement('div');
    const ideal = checkout.create('ideal', { ...args.componentConfiguration });
    ideal.mount(container);
    addToWindow(ideal);
    return container;
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
