import { Meta, StoryFn } from '@storybook/html';
import { PaymentMethodStoryProps } from '../types';
import { UIElementProps } from '@adyen/adyen-web/dist/types/components/types';
import { addToWindow } from '../../utils/add-to-window';
import { getStoryContextCheckout } from '../../utils/get-story-context-checkout';

export default {
    title: 'IssuerLists/IDEAL'
} as Meta;

const Template: StoryFn<PaymentMethodStoryProps<UIElementProps>> = (props, context): HTMLDivElement => {
    const checkout = getStoryContextCheckout(context);
    const container = document.createElement('div');
    const ideal = checkout.create('ideal', { ...props.componentConfiguration });
    ideal.mount(container);
    addToWindow(ideal);
    return container;
};

export const Default = Template.bind({}) as StoryFn<PaymentMethodStoryProps<UIElementProps>>;
Default.args = {
    countryCode: 'NL'
};

export const WithHighlightedIssuers = Template.bind({}) as StoryFn<PaymentMethodStoryProps<UIElementProps>>;
WithHighlightedIssuers.args = {
    countryCode: 'NL',
    componentConfiguration: {
        // @ts-ignore TODO: 'highlightedIssuers' is not documented
        highlightedIssuers: ['1121', '1154', '1153']
    }
};
